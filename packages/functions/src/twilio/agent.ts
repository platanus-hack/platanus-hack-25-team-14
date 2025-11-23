import {
  AgentRunStatus,
  Conversation,
  Prisma,
  UploadIntentStatus,
} from "@prisma/client";
import { prisma } from "@medical-platform/core";
import { sendWhatsAppMessage } from "./client";
import {
  dispatchUploadIntent,
  captureMediaFromMessage,
} from "./uploadDispatcher";
import type { TwilioWebhookPayload } from "./types";
import {
  transcribeAudio,
  runMedicalAgentTurn,
  classifyMedicalQuery,
  generateExamExplanation,
  generateClinicalHistorySummary,
  type MedicalQueryIntent,
} from "./openai";
import { buildConversationHistory } from "./conversationHistory";
import {
  PATIENT_HISTORY_INCLUDE,
  buildLatestExamSummaryInput,
  buildClinicalHistorySummaryInput,
} from "./medicalSummaries";

type AgentContext = {
  conversation: Conversation;
  payload: TwilioWebhookPayload;
};

/**
 * Main conversational agent handler - truly conversational with OpenAI
 */
export async function handleTwilioInboundAgent(context: AgentContext) {
  const { conversation, payload } = context;

  // Get or create active upload intent
  let intent = await prisma.uploadIntent.findFirst({
    where: {
      conversationId: conversation.id,
      status: {
        in: [UploadIntentStatus.COLLECTING, UploadIntentStatus.READY],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Check for media (including audio)
  const mediaCapture = captureMediaFromMessage(payload);

  // Get user message text
  let userMessageText = extractTextualAnswer(payload);

  // If audio message, transcribe it
  if (mediaCapture?.isAudio && !userMessageText) {
    try {
      console.log("🎤 Transcribing audio message...");
      userMessageText = await transcribeAudio(
        mediaCapture.url,
        mediaCapture.mimeType
      );
      console.log("📝 Transcription:", userMessageText);

      // Send acknowledgment that we heard the audio
      await sendWhatsAppMessage({
        to: conversation.fromPhoneNumber,
        body: "🎧 Escuché tu mensaje...",
      });
    } catch (error) {
      console.error("❌ Failed to transcribe audio:", error);
      await sendWhatsAppMessage({
        to: conversation.fromPhoneNumber,
        body: "No pude escuchar el audio claramente. ¿Podrías escribirlo o enviarlo de nuevo?",
      });
      return;
    }
  }

  // If this is the first message and no intent exists, create one
  if (!intent) {
    intent = await prisma.uploadIntent.create({
      data: {
        conversationId: conversation.id,
        patientId: conversation.patientId ?? undefined,
        status: UploadIntentStatus.COLLECTING,
      },
    });
  }

  // If no text message, check if it's just a document without context
  if (!userMessageText && mediaCapture && !mediaCapture.isAudio) {
    userMessageText = "[El usuario envió un archivo]";
  }

  // If still no message, this might be a status update or something we can't process
  if (!userMessageText) {
    console.log("⚠️ No processable message content");
    return;
  }

  // Get conversation history from the database
  const conversationHistory = await buildConversationHistory(conversation.id);

  if (shouldAttemptMedicalLookup(userMessageText)) {
    const classification = await classifyMedicalQuery({
      message: userMessageText,
      history: conversationHistory,
    });
    console.log("🧭 Medical intent classification:", classification);

    if (
      classification.intent === "LAST_EXAM" ||
      classification.intent === "CLINICAL_HISTORY"
    ) {
      const handled = await handleMedicalInformationIntent({
        conversation,
        intent: classification.intent,
      });
      if (handled) {
        return;
      }
    }
  }

  // Prepare current state
  const currentState = {
    documentType: intent.documentType,
    documentDateText: intent.documentDateText,
    documentTitle: intent.documentTitle,
    hasDocument: Boolean(
      intent.documentSourceUrl || (mediaCapture && !mediaCapture.isAudio)
    ),
  };

  console.log("💭 Current state:", currentState);
  console.log("💬 User message:", userMessageText);

  const agentTurn = await runMedicalAgentTurn({
    conversation,
    intent,
    currentMessage: userMessageText,
    currentState,
  });

  const agentResponse = agentTurn.agentResponse;

  // Update conversation with openAiResponseId for tracking
  if (agentTurn.openAiResponseId) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { openAiConversationId: agentTurn.openAiResponseId },
    });
  }

  // Record agent run for auditing
  await prisma.agentRun.create({
    data: {
      conversationId: conversation.id,
      openAiConversationId: agentTurn.openAiResponseId ?? "unknown",
      responseId: agentTurn.openAiResponseId ?? undefined,
      status: agentTurn.errorMessage
        ? AgentRunStatus.FAILED
        : AgentRunStatus.COMPLETED,
      userMessage: userMessageText,
      lastOutput: agentResponse.message,
      requestPayload: currentState as Prisma.JsonObject,
      responsePayload: agentTurn.requestedToolCalls
        ? (agentTurn.requestedToolCalls as unknown as Prisma.JsonObject)
        : undefined,
      requestedToolCalls: agentTurn.requestedToolCalls
        ? (agentTurn.requestedToolCalls as unknown as Prisma.JsonObject)
        : Prisma.JsonNull,
      submittedToolOutputs: agentTurn.submittedToolOutputs
        ? (agentTurn.submittedToolOutputs as unknown as Prisma.JsonObject)
        : Prisma.JsonNull,
      errorMessage: agentTurn.errorMessage,
    },
  });

  console.log("🤖 Agent response:", agentResponse);

  // Update the intent with extracted data
  const updateInput: Prisma.UploadIntentUpdateInput = {};

  // Extract document type
  if (agentResponse.extractedData.documentType && !intent.documentType) {
    updateInput.documentType = agentResponse.extractedData.documentType;
    console.log("📋 Extracted document type:", updateInput.documentType);
  }

  // Extract date
  if (
    agentResponse.extractedData.documentDateText &&
    !intent.documentDateText
  ) {
    updateInput.documentDateText = agentResponse.extractedData.documentDateText;
    console.log("📅 Extracted date:", updateInput.documentDateText);
  }

  // Extract title
  if (agentResponse.extractedData.documentTitle && !intent.documentTitle) {
    updateInput.documentTitle = agentResponse.extractedData.documentTitle;
    console.log("🏷️ Extracted title:", updateInput.documentTitle);
  }

  // Capture document file (non-audio media)
  if (mediaCapture && !mediaCapture.isAudio && !intent.documentSourceUrl) {
    updateInput.documentSourceUrl = mediaCapture.url;
    updateInput.documentMimeType = mediaCapture.mimeType;
    updateInput.documentFileName = mediaCapture.fileName;
    updateInput.providerMediaId = mediaCapture.mediaSid;
    updateInput.documentMessageId = payload.MessageSid;
    console.log("📎 Captured document:", mediaCapture.mimeType);
  }

  // Check if we have all required information (from either update or existing intent)
  const finalDocumentType = updateInput.documentType || intent.documentType;
  const finalDocumentDate =
    updateInput.documentDateText || intent.documentDateText;
  const finalDocumentTitle = updateInput.documentTitle || intent.documentTitle;
  const finalDocumentUrl =
    updateInput.documentSourceUrl || intent.documentSourceUrl;

  const hasAllInfo = Boolean(
    finalDocumentType &&
      finalDocumentDate &&
      finalDocumentTitle &&
      finalDocumentUrl
  );

  console.log("✅ Has all info?", hasAllInfo, {
    type: !!finalDocumentType,
    date: !!finalDocumentDate,
    title: !!finalDocumentTitle,
    file: !!finalDocumentUrl,
  });

  // If OpenAI says it's complete or we verified we have everything, mark as ready
  if (hasAllInfo || agentResponse.isComplete) {
    updateInput.status = UploadIntentStatus.READY;
    updateInput.awaitingField = null;
  }

  // Persist updates
  const updatedIntent = await persistUpdates(intent.id, updateInput);

  // If ready, dispatch the upload
  if (updatedIntent.status === UploadIntentStatus.READY) {
    const processingMessage = agentResponse.message
      ? `${agentResponse.message}\n\n⏳ Un momento mientras proceso tu documento...`
      : "⏳ Un momento mientras proceso tu documento...";

    await sendWhatsAppMessage({
      to: conversation.fromPhoneNumber,
      body: processingMessage,
    });

    try {
      await dispatchUploadIntent(updatedIntent.id);

      await sendWhatsAppMessage({
        to: conversation.fromPhoneNumber,
        body: "✅ ¡Listo! Tu documento fue guardado exitosamente en tu ficha clínica.",
      });

      // Mark intent as resolved
      await prisma.uploadIntent.update({
        where: { id: updatedIntent.id },
        data: {
          metadata: mergeMetadata(updatedIntent.metadata, {
            completedAt: new Date().toISOString(),
          }),
        },
      });
    } catch (error) {
      console.error("❌ Failed to dispatch upload:", error);
      await sendWhatsAppMessage({
        to: conversation.fromPhoneNumber,
        body: "Ups, hubo un problema al guardar el documento. ¿Puedes intentarlo de nuevo?",
      });

      // Reset status to COLLECTING so user can try again
      await prisma.uploadIntent.update({
        where: { id: updatedIntent.id },
        data: { status: UploadIntentStatus.COLLECTING },
      });
    }

    return;
  }

  // Send the conversational response
  await sendWhatsAppMessage({
    to: conversation.fromPhoneNumber,
    body: agentResponse.message,
  });

  console.log("✉️ Sent response to user");
}

/**
 * Persist intent updates to database
 */
async function persistUpdates(
  intentId: string,
  data: Prisma.UploadIntentUpdateInput
) {
  if (Object.keys(data).length === 0) {
    return prisma.uploadIntent.findUniqueOrThrow({ where: { id: intentId } });
  }

  return prisma.uploadIntent.update({
    where: { id: intentId },
    data,
  });
}

/**
 * Extract text from webhook payload
 */
function extractTextualAnswer(
  payload: TwilioWebhookPayload
): string | undefined {
  const text = payload.Body?.trim();
  return text && text.length > 0 ? text : undefined;
}

/**
 * Merge metadata objects
 */
function mergeMetadata(
  existing: Prisma.JsonValue | null | undefined,
  patch: Record<string, Prisma.JsonValue>
): Prisma.JsonObject {
  const base =
    typeof existing === "object" && existing !== null
      ? (existing as Prisma.JsonObject)
      : {};
  return {
    ...base,
    ...patch,
  };
}

function shouldAttemptMedicalLookup(message?: string) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  if (normalized.startsWith("[el usuario envió")) {
    return false;
  }

  const keywords = [
    "examen",
    "resultado",
    "historial",
    "historia clínica",
    "historia clinica",
    "ficha",
    "datos médicos",
    "datos medicos",
    "consulta médica",
    "consulta medica",
  ];

  return keywords.some((keyword) => normalized.includes(keyword));
}

async function handleMedicalInformationIntent({
  conversation,
  intent,
}: {
  conversation: Conversation;
  intent: Exclude<MedicalQueryIntent, "NONE">;
}) {
  if (!conversation.patientId) {
    await sendWhatsAppMessage({
      to: conversation.fromPhoneNumber,
      body: "Aún no tengo tu ficha clínica vinculada, así que no puedo mostrarte información histórica. ¿Te gustaría subir un documento para empezar?",
    });
    return true;
  }

  if (intent === "LAST_EXAM") {
    return handleLatestExamRequest(conversation);
  }

  return handleClinicalHistoryRequest(conversation);
}

async function handleLatestExamRequest(conversation: Conversation) {
  try {
    const [patient, exam] = await Promise.all([
      prisma.patient.findUnique({
        where: { id: conversation.patientId! },
        select: { fullName: true },
      }),
      prisma.exam.findFirst({
        where: { patientId: conversation.patientId! },
        orderBy: [{ examDate: "desc" }, { createdAt: "desc" }],
        include: {
          results: {
            orderBy: { orderIndex: "asc" },
            take: 12,
          },
        },
      }),
    ]);

    if (!exam) {
      await sendWhatsAppMessage({
        to: conversation.fromPhoneNumber,
        body: "Todavía no encuentro exámenes guardados en tu ficha. Si tienes uno a mano, puedo ayudarte a subirlo.",
      });
      return true;
    }

    const summaryInput = buildLatestExamSummaryInput(exam, patient?.fullName);
    const explanation = await generateExamExplanation(summaryInput);

    await sendWhatsAppMessage({
      to: conversation.fromPhoneNumber,
      body: explanation,
    });

    return true;
  } catch (error) {
    console.error("Error handling latest exam intent:", error);
    await sendWhatsAppMessage({
      to: conversation.fromPhoneNumber,
      body: "Ups, no logré revisar tus exámenes ahora mismo. Intentemos de nuevo en un ratito.",
    });
    return true;
  }
}

async function handleClinicalHistoryRequest(conversation: Conversation) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: conversation.patientId! },
      include: PATIENT_HISTORY_INCLUDE,
    });

    if (!patient) {
      await sendWhatsAppMessage({
        to: conversation.fromPhoneNumber,
        body: "No pude encontrar tu ficha clínica. Probemos nuevamente más tarde o envíame un documento para crearla.",
      });
      return true;
    }

    const summaryInput = buildClinicalHistorySummaryInput(patient);
    const summary = await generateClinicalHistorySummary(summaryInput);

    await sendWhatsAppMessage({
      to: conversation.fromPhoneNumber,
      body: summary,
    });
    return true;
  } catch (error) {
    console.error("Error handling clinical history intent:", error);
    await sendWhatsAppMessage({
      to: conversation.fromPhoneNumber,
      body: "No pude armar el resumen clínico ahora mismo. Intentemos en unos minutos.",
    });
    return true;
  }
}
