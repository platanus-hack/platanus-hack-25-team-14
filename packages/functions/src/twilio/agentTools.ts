import { prisma } from "@medical-platform/core";
import { sendWhatsAppMessage } from "./client";
import {
  generateExamExplanation,
  generateClinicalHistorySummary,
  type LatestExamSummaryInput,
  type ClinicalHistorySummaryInput,
} from "./openai";
import {
  buildLatestExamSummaryInput,
  buildClinicalHistorySummaryInput,
  PATIENT_HISTORY_INCLUDE,
  type PatientHistorySnapshot,
  type ExamWithResults,
} from "./medicalSummaries";
import { dispatchUploadIntent } from "./uploadDispatcher";

/**
 * Tool definitions for OpenAI Agents SDK
 */
export const AGENT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "lookup_latest_exam",
      description:
        "Busca y resume el examen médico más reciente del paciente en su ficha clínica. Retorna un resumen objetivo de los resultados sin diagnóstico.",
      parameters: {
        type: "object",
        properties: {
          patientId: {
            type: "string",
            description: "ID del paciente cuyo examen se desea consultar",
          },
        },
        required: ["patientId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "lookup_clinical_history",
      description:
        "Genera un resumen completo del historial clínico del paciente, incluyendo alergias, condiciones, cirugías, medicamentos activos, consultas y exámenes recientes.",
      parameters: {
        type: "object",
        properties: {
          patientId: {
            type: "string",
            description:
              "ID del paciente cuyo historial clínico se desea consultar",
          },
        },
        required: ["patientId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "store_upload_intent",
      description:
        "Marca el uploadIntent como listo para procesar y dispara el upload del documento a S3 y la base de datos. Solo llamar cuando se tengan todos los campos: documentType, documentDateText, documentTitle y documentSourceUrl.",
      parameters: {
        type: "object",
        properties: {
          uploadIntentId: {
            type: "string",
            description: "ID del uploadIntent a marcar como READY y procesar",
          },
          documentType: {
            type: "string",
            description:
              "Tipo de documento (ej: examen, receta, certificado médico)",
          },
          documentDateText: {
            type: "string",
            description:
              "Fecha del documento en texto (ej: '2024-11-23', 'la semana pasada')",
          },
          documentTitle: {
            type: "string",
            description:
              "Título descriptivo del documento (ej: 'Hemograma completo')",
          },
        },
        required: [
          "uploadIntentId",
          "documentType",
          "documentDateText",
          "documentTitle",
        ],
      },
    },
  },
];

/**
 * Tool handlers - ejecutan la lógica cuando el Agent llama una tool
 * Compatible con Responses API y Chat Completions API
 */
export async function handleAgentToolCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  console.log(`🔧 Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
      case "lookup_latest_exam":
        return await lookupLatestExam(args.patientId as string);

      case "lookup_clinical_history":
        return await lookupClinicalHistory(args.patientId as string);

      case "store_upload_intent":
        return await storeUploadIntent({
          uploadIntentId: args.uploadIntentId as string,
          documentType: args.documentType as string,
          documentDateText: args.documentDateText as string,
          documentTitle: args.documentTitle as string,
        });

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`❌ Tool execution failed: ${toolName}`, error);
    return JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
      toolName,
    });
  }
}

/**
 * Utility: Inject context into tool arguments for Responses API
 * This ensures patientId and uploadIntentId are available to tools
 */
export function injectToolContext(
  args: Record<string, unknown>,
  toolName: string,
  context: {
    patientId?: string | null;
    uploadIntentId?: string;
  }
): Record<string, unknown> {
  const enrichedArgs = { ...args };

  // Inject patientId for medical lookup tools
  if (
    (toolName === "lookup_latest_exam" ||
      toolName === "lookup_clinical_history") &&
    context.patientId
  ) {
    enrichedArgs.patientId = enrichedArgs.patientId ?? context.patientId;
  }

  // Inject uploadIntentId for storage tool
  if (toolName === "store_upload_intent" && context.uploadIntentId) {
    enrichedArgs.uploadIntentId =
      enrichedArgs.uploadIntentId ?? context.uploadIntentId;
  }

  return enrichedArgs;
}

async function lookupLatestExam(patientId: string): Promise<string> {
  const [patient, exam] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: patientId },
      select: { fullName: true },
    }),
    prisma.exam.findFirst({
      where: { patientId },
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
    return JSON.stringify({
      success: false,
      message:
        "No se encontraron exámenes en la ficha clínica de este paciente.",
    });
  }

  const summaryInput: LatestExamSummaryInput = buildLatestExamSummaryInput(
    exam as ExamWithResults,
    patient?.fullName
  );
  const explanation = await generateExamExplanation(summaryInput);

  return JSON.stringify({
    success: true,
    summary: explanation,
    examTitle: exam.title,
    examDate: exam.examDate?.toISOString().split("T")[0],
  });
}

async function lookupClinicalHistory(patientId: string): Promise<string> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: PATIENT_HISTORY_INCLUDE,
  });

  if (!patient) {
    return JSON.stringify({
      success: false,
      message: "No se encontró la ficha clínica de este paciente.",
    });
  }

  const summaryInput: ClinicalHistorySummaryInput =
    buildClinicalHistorySummaryInput(patient as PatientHistorySnapshot);
  const summary = await generateClinicalHistorySummary(summaryInput);

  return JSON.stringify({
    success: true,
    summary,
    patientName: patient.fullName,
  });
}

async function storeUploadIntent(params: {
  uploadIntentId: string;
  documentType: string;
  documentDateText: string;
  documentTitle: string;
}): Promise<string> {
  const { uploadIntentId, documentType, documentDateText, documentTitle } =
    params;

  // Update intent con los datos extraídos y marcar como READY
  const intent = await prisma.uploadIntent.update({
    where: { id: uploadIntentId },
    data: {
      documentType,
      documentDateText,
      documentTitle,
      status: "READY",
      awaitingField: null,
    },
    include: { conversation: true },
  });

  if (!intent.documentSourceUrl) {
    return JSON.stringify({
      success: false,
      error: "NO_FILE",
      message:
        "El intent no tiene documentSourceUrl, no se puede procesar todavía.",
    });
  }

  // Dispatch upload
  try {
    await dispatchUploadIntent(uploadIntentId);

    // Send success message
    if (intent.conversation) {
      await sendWhatsAppMessage({
        to: intent.conversation.fromPhoneNumber,
        body: "✅ ¡Listo! Tu documento fue guardado exitosamente en tu ficha clínica.",
      });
    }

    // Mark intent as resolved
    await prisma.uploadIntent.update({
      where: { id: uploadIntentId },
      data: {
        metadata: {
          ...(typeof intent.metadata === "object" && intent.metadata !== null
            ? intent.metadata
            : {}),
          completedAt: new Date().toISOString(),
        },
      },
    });

    return JSON.stringify({
      success: true,
      message: "Documento guardado exitosamente en la ficha clínica.",
    });
  } catch (error) {
    console.error("❌ Failed to dispatch upload:", error);

    // Send error message
    if (intent.conversation) {
      await sendWhatsAppMessage({
        to: intent.conversation.fromPhoneNumber,
        body: "Ups, hubo un problema al guardar el documento. ¿Puedes intentarlo de nuevo?",
      });
    }

    // Reset status to COLLECTING so user can try again
    await prisma.uploadIntent.update({
      where: { id: uploadIntentId },
      data: { status: "COLLECTING" },
    });

    return JSON.stringify({
      success: false,
      error: "DISPATCH_FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Error desconocido al procesar el documento",
    });
  }
}
