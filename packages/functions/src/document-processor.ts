import { S3Event } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Resource } from "sst";
import { prisma } from "@medical-platform/core";
import Anthropic from "@anthropic-ai/sdk";
import { ConsultationData, ExamData, PrescriptionData } from "./types";
import { consultationPrompt, examPrompt, prescriptionPrompt } from "./constant";

const s3Client = new S3Client({});

// Inicializar cliente de Anthropic (lazy para acceder a Resource)
let anthropicClient: Anthropic | null = null;

const promptForDocumentType = (documentType: string) => {
  switch (documentType) {
    case "prescription":
      return prescriptionPrompt;
    case "exam_report":
      return examPrompt;
    case "consultation_summary":
      return consultationPrompt;
  }
};

function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: Resource.AnthropicApiKey.value,
    });
  }
  return anthropicClient;
}

const extractData = async (
  documentData: Uint8Array,
  mimeType: string,
  prompt: string
): Promise<PrescriptionData | ExamData | ConsultationData> => {
  const base64Document = Buffer.from(documentData).toString("base64");
  const anthropic = getAnthropicClient();

  const supportedTypes = ["image/jpeg", "image/png", "application/pdf"];

  if (!supportedTypes.includes(mimeType)) {
    throw new Error(
      `Unsupported file type: ${mimeType}. Supported: ${supportedTypes.join(
        ", "
      )}`
    );
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514", // Claude Sonnet 4 - soporta PDFs y disponible en tu plan
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document" as any, // Claude trata PDFs e imágenes de forma similar
            source: {
              type: "base64",
              media_type: mimeType as any,
              data: base64Document,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  const response = message.content[0];
  console.log({ WTF: response });
  if (response.type !== "text") {
    throw new Error("Unexpected response type from Anthropic");
  }

  const jsonMatch = response.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Anthropic response");
  }

  return JSON.parse(jsonMatch[0]);
};

export const handler = async (event: any) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  // Detectar si es un evento HTTP (Function URL) o S3 directo
  let s3Event: S3Event;

  if (event.body && typeof event.body === "string") {
    // Es un evento HTTP - parsear el body
    console.log("Received HTTP request, parsing body...");
    try {
      s3Event = JSON.parse(event.body);
    } catch (error) {
      console.error("Failed to parse body:", error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON in body" }),
      };
    }
  } else if (event.Records) {
    // Es un evento S3 directo
    console.log("Received S3 event directly");
    s3Event = event as S3Event;
  } else {
    console.error("Unknown event format:", event);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Unknown event format" }),
    };
  }

  for (const record of s3Event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    console.log({ key });

    // Extraer el tipo de documento del prefijo de la key (exam/, prescription/, consultation/)
    const documentTypeMatch = key.match(
      /^(exam_report|prescription|consultation_summary)\//
    );
    if (!documentTypeMatch) {
      console.log(`⚠️ Skipping file with unknown type: ${key}`);
      return;
    }
    const documentType = documentTypeMatch[1] as
      | "exam_report"
      | "prescription"
      | "consultation_summary";

    if (!documentType) {
      console.log(`⚠️ Skipping file with unknown type: ${key}`);
      return;
    }
    console.log({ documentType });

    const eventName = record.eventName;

    console.log(`Event: ${eventName}, Bucket: ${bucket}, Key: ${key}`);

    // Only process direct upload events (not copies or other operations)
    const uploadEvents = [
      "ObjectCreated:Put",
      "ObjectCreated:Post",
      "ObjectCreated:CompleteMultipartUpload",
    ];

    if (!uploadEvents.some((evt) => eventName.includes(evt))) {
      console.log(`Skipping event: ${eventName} (not a direct upload)`);
      return;
    }
    try {
      const attachment = await prisma.attachment.findFirst({
        where: {
          storageKey: key,
        },
      });
      if (!attachment) {
        console.log(`Attachment does not exists: ${key}`);
        return;
      }
      const clinicalDocument = await prisma.clinicalDocument.findFirst({
        where: {
          attachmentId: attachment?.id,
        },
      });
      if (!clinicalDocument) {
        console.log(`Clinical document does not exists: ${key}`);
        return;
      }
      const patientId = clinicalDocument.patientId;

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await s3Client.send(command);

      const documentBody = await response.Body?.transformToByteArray();

      if (!documentBody) {
        console.error(`No body found for ${key}`);
        return;
      }

      console.log(
        `Processing document: ${key}, Size: ${documentBody.length} bytes, Type: ${response.ContentType}`
      );

      const mimeType = response.ContentType;

      if (!mimeType) return;

      const prompt = promptForDocumentType(documentType);

      if (!prompt) {
        console.log(`⚠️ Skipping file with unknown type: ${key}`);
        return;
      }
      const data = await extractData(documentBody, mimeType, prompt);

      console.log("Extracted data:", JSON.stringify(data, null, 2));
      const table =
        documentType === "prescription" ? "medicationPlan" : documentType;
      console.log("WTF", table);
      if (documentType === "exam_report") {
        await prisma.exam.create({
          data: {
            ...(data as ExamData),
            patient: {
              connect: {
                id: patientId,
              },
            },
          },
        });
      } else if (documentType === "prescription") {
        await prisma.medicationPlan.create({
          data: {
            ...(data as PrescriptionData),
            patient: {
              connect: {
                id: patientId,
              },
            },
          },
        });
      } else if (documentType === "consultation") {
        await prisma.consultation.create({
          data: {
            ...(data as ConsultationData),
            patient: {
              connect: {
                id: patientId,
              },
            },
          },
        });
      }
    } catch (error) {
      console.error(`❌ Error processing ${key}:`, error);
      throw error;
    }
  }
};
