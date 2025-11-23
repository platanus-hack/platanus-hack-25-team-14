import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  Attachment,
  DocumentType,
  ExamCategory,
  ExamSource,
  Prisma,
  UploadIntentStatus,
} from "@prisma/client";
import { prisma } from "@medical-platform/core";
import { Resource } from "sst";
import { downloadMedia, sendWhatsAppMessage } from "./client";
import { normalizePhoneNumber } from "./utils";
import type { TwilioWebhookPayload } from "./types";

const s3 = new S3Client({});

export async function dispatchUploadIntent(intentId: string) {
  const intent = await prisma.uploadIntent.findUnique({
    where: { id: intentId },
    include: { conversation: true },
  });

  if (!intent || intent.status !== UploadIntentStatus.READY) {
    return;
  }

  if (!intent.documentSourceUrl || !intent.conversation) {
    await prisma.uploadIntent.update({
      where: { id: intentId },
      data: {
        status: UploadIntentStatus.FAILED,
        metadata: mergeMetadata(intent.metadata, {
          failure: "Missing document source or conversation data",
        }),
      },
    });
    return;
  }

  const conversation = intent.conversation;
  let patientId = intent.patientId ?? conversation.patientId;

  if (!patientId) {
    const normalizedPhone = normalizePhoneNumber(conversation.fromPhoneNumber);
    const fallbackPatient = await prisma.patient.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: conversation.fromPhoneNumber },
        ],
      },
    });

    if (fallbackPatient) {
      patientId = fallbackPatient.id;
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { patientId },
      });
      await prisma.uploadIntent.update({
        where: { id: intent.id },
        data: { patientId },
      });
    }
  }

  if (!patientId) {
    await sendWhatsAppMessage({
      to: conversation.fromPhoneNumber,
      body: "No encontramos tu ficha clinica. Por favor revisa tus datos en la app antes de continuar.",
    });
    await prisma.uploadIntent.update({
      where: { id: intent.id },
      data: {
        status: UploadIntentStatus.FAILED,
        metadata: mergeMetadata(intent.metadata, {
          failure: "PATIENT_NOT_LINKED",
        }),
      },
    });
    return;
  }

  try {
    const media = await downloadMedia(intent.documentSourceUrl);
    const mimeType =
      intent.documentMimeType ??
      media.contentType ??
      "application/octet-stream";
    const fileName = sanitizeFileName(
      intent.documentFileName ??
        media.suggestedFileName ??
        `documento-${intent.id}.${mimeType.split("/")[1] ?? "pdf"}`
    );

    const storageKey = `${patientId}/${intent.id}/${fileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: Resource.Exams.name,
        Key: storageKey,
        Body: media.buffer,
        ContentType: mimeType,
      })
    );

    const { recordType, attachmentId, createdExamId } =
      await prisma.$transaction(async (tx) => {
        if (isExamDocument(intent.documentType)) {
          const createdExam = await tx.exam.create({
            data: {
              title: intent.documentTitle ?? "Documento enviado por WhatsApp",
              patientId,
              category: guessExamCategory(intent.documentType),
              examDate: tryParseDate(intent.documentDateText) ?? undefined,
              source: ExamSource.WHATSAPP_UPLOAD,
              sourceMessageId: intent.documentMessageId ?? undefined,
              sourceChannel: "twilio",
              attachments: {
                create: {
                  storageKey,
                  fileName,
                  mimeType,
                  source: "whatsapp",
                  sourceUrl: intent.documentSourceUrl,
                },
              },
            },
            include: {
              attachments: true,
            },
          });

          const attachmentRecord = createdExam.attachments[0] as
            | Attachment
            | undefined;

          await tx.uploadIntent.update({
            where: { id: intent.id },
            data: {
              status: UploadIntentStatus.DISPATCHED,
              dispatchedAt: new Date(),
              metadata: mergeMetadata(intent.metadata, {
                createdExamId: createdExam.id,
                storageKey,
              }),
            },
          });

          return {
            recordType: "exam" as const,
            attachmentId: attachmentRecord?.id,
            createdExamId: createdExam.id,
          };
        }

        const attachment = await tx.attachment.create({
          data: {
            storageKey,
            fileName,
            mimeType,
            source: "whatsapp",
            sourceUrl: intent.documentSourceUrl,
          },
        });

        await tx.clinicalDocument.create({
          data: {
            patientId,
            docType: mapClinicalDocumentType(intent.documentType),
            title: intent.documentTitle ?? "Documento enviado por WhatsApp",
            attachmentId: attachment.id,
          },
        });

        await tx.uploadIntent.update({
          where: { id: intent.id },
          data: {
            status: UploadIntentStatus.DISPATCHED,
            dispatchedAt: new Date(),
            metadata: mergeMetadata(intent.metadata, {
              attachmentId: attachment.id,
              storageKey,
            }),
          },
        });

        return {
          recordType: "document" as const,
          attachmentId: attachment.id,
          createdExamId: null,
        };
      });

    await sendWhatsAppMessage({
      to: conversation.fromPhoneNumber,
      body:
        recordType === "exam"
          ? "Tu examen fue almacenado correctamente."
          : "Tu documento fue guardado en tu ficha clinica.",
    });

    return { attachmentId, createdExamId };
  } catch (error) {
    console.error("Twilio upload dispatcher failure", error);
    await prisma.uploadIntent.update({
      where: { id: intent.id },
      data: {
        status: UploadIntentStatus.FAILED,
        metadata: mergeMetadata(intent.metadata, {
          failure: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        }),
      },
    });

    await sendWhatsAppMessage({
      to: conversation.fromPhoneNumber,
      body: "Tuvimos un problema al subir tu documento. Intentemoslo de nuevo en unos minutos.",
    });
    throw error;
  }
}

export function captureMediaFromMessage(payload: TwilioWebhookPayload) {
  const numMedia = Number(payload.NumMedia ?? "0");
  if (Number.isNaN(numMedia) || numMedia <= 0) {
    return null;
  }

  const url = payload["MediaUrl0"];
  if (!url) {
    return null;
  }

  const mimeType = payload["MediaContentType0"];
  const isAudio = mimeType?.startsWith("audio/");

  return {
    url,
    mimeType,
    fileName: deriveFileName(mimeType),
    mediaSid: extractMediaSid(url),
    isAudio,
  };
}

function isExamDocument(documentType?: string | null) {
  if (!documentType) return false;
  const normalized = documentType.toLowerCase();
  return (
    normalized.includes("examen") ||
    normalized.includes("laboratorio") ||
    normalized.includes("resultado") ||
    normalized.includes("imagen")
  );
}

function guessExamCategory(documentType?: string | null): ExamCategory {
  if (!documentType) return ExamCategory.OTHER;
  const normalized = documentType.toLowerCase();
  if (
    normalized.includes("lab") ||
    normalized.includes("sangre") ||
    normalized.includes("hemat")
  ) {
    return ExamCategory.LAB;
  }

  if (
    normalized.includes("imagen") ||
    normalized.includes("rayos") ||
    normalized.includes("eco")
  ) {
    return ExamCategory.IMAGING;
  }

  return ExamCategory.OTHER;
}

function mapClinicalDocumentType(documentType?: string | null): DocumentType {
  if (!documentType) return DocumentType.OTHER;
  const normalized = documentType.toLowerCase();
  if (normalized.includes("receta") || normalized.includes("prescripcion")) {
    return DocumentType.PRESCRIPTION;
  }

  if (normalized.includes("certific")) {
    return DocumentType.MEDICAL_CERTIFICATE;
  }

  if (normalized.includes("consulta")) {
    return DocumentType.CONSULTATION_SUMMARY;
  }

  if (normalized.includes("examen")) {
    return DocumentType.EXAM_REPORT;
  }

  return DocumentType.OTHER;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w\-.]/g, "_");
}

function tryParseDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

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

function deriveFileName(mimeType?: string) {
  if (!mimeType) return undefined;
  const extension = mimeType.split("/")[1];
  if (!extension) return undefined;
  return `document.${extension}`;
}

function extractMediaSid(url: string) {
  const match = url.match(/Media\/([^\/?]+)/);
  return match?.[1];
}
