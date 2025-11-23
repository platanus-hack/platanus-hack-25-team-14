import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  PrismaClient,
  DocumentType,
  ClinicalDocument,
} from "@prisma/client";
import { builder, prisma as corePrisma } from "@medical-platform/core";
import { Resource } from "sst";

// Ensure we pick up the workspace-generated Prisma types (MedicalExam, etc.)
const prisma = corePrisma as PrismaClient;
const s3 = new S3Client({});
const UPLOAD_URL_TTL_SECONDS = 900;
const DOWNLOAD_URL_TTL_SECONDS = 3600;

const attachmentSelect = {
  attachments: {
    take: 1,
    orderBy: { uploadedAt: "desc" },
    select: {
      storageKey: true,
      fileName: true,
      mimeType: true,
    },
  },
} as const;

const resolveStorageKey = (
  exam: { attachments?: { storageKey: string | null }[] } | null | undefined
) => exam?.attachments?.[0]?.storageKey ?? null;

builder.prismaObject("Exam", {
  fields: (t: any) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    status: t.string({
      resolve: (exam: any) => exam.ocrStatus ?? "PENDING",
    }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    fileKey: t.string({
      select: attachmentSelect,
      resolve: (exam: any) => resolveStorageKey(exam) ?? "",
    }),
    presignedUrl: t.string({
      description:
        "Temporary S3 URL to upload/overwrite the primary attachment for this exam",
      select: attachmentSelect,
      resolve: async (exam: any) => {
        const storageKey = resolveStorageKey(exam);

        if (!storageKey) {
          throw new Error("Exam does not have an attachment placeholder yet");
        }

        const command = new PutObjectCommand({
          Bucket: Resource.Exams.name,
          Key: storageKey,
          ContentType: exam.attachments?.[0]?.mimeType ?? "application/pdf",
        });

        return getSignedUrl(s3, command, { expiresIn: UPLOAD_URL_TTL_SECONDS });
      },
    }),
    downloadUrl: t.string({
      description:
        "Temporary S3 URL to download the latest attachment for this exam",
      select: attachmentSelect,
      resolve: async (exam: any) => {
        const storageKey = resolveStorageKey(exam);

        if (!storageKey) {
          return "";
        }

        const command = new GetObjectCommand({
          Bucket: Resource.Exams.name,
          Key: storageKey,
        });

        return getSignedUrl(s3, command, {
          expiresIn: DOWNLOAD_URL_TTL_SECONDS,
        });
      },
    }),
  }),
});

// All exams, any patient
builder.queryField("exams", (t: any) =>
  t.prismaField({
    type: ["Exam"],
    resolve: (query: any) =>
      prisma.exam.findMany({
        ...query,
        orderBy: { createdAt: "desc" },
      }),
  })
);

// Exams for a specific patient
builder.queryField("getPatientExams", (t) =>
  t.prismaField({
    type: ["Exam"],
    args: {
      patientId: t.arg.string({ required: true }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: (query, _root, args): any =>
      prisma.exam.findMany({
        ...query,
        where: { patientId: args.patientId },
        orderBy: { createdAt: "desc" },
      }),
  })
);

builder.queryField("exam", (t: any) =>
  t.prismaField({
    type: "Exam",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (query: any, _root: any, args: any) =>
      prisma.exam.findUnique({
        ...query,
        where: { id: args.id },
      }),
  })
);

// Mutación genérica para preparar la subida de un documento clínico.
// Por ahora reutiliza MedicalExam como contenedor técnico, y además
// crea un ClinicalDocument asociado al mismo archivo en S3.
builder.mutationField("createDocumentUpload", (t: any) =>
  t.prismaField({
    type: "Exam",
    args: {
      title: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
      filename: t.arg.string({ required: true }),
      mimeType: t.arg.string(),
      // Categoría "externa" (LAB, IMAGING, CLINICAL, OTHER) que mapeamos a ExamCategory
      category: t.arg.string({ required: false }),
      // Tipo de documento clínico (CONSULTATION_SUMMARY, EXAM_REPORT, PRESCRIPTION, etc.)
      docType: t.arg.string({ required: true }),
    },
    resolve: async (query: any, _root: any, args: any): Promise<any> => {
      // Buscar el paciente asociado al usuario autenticado
      console.log({ args });
      const patient = await prisma.patient.findFirst({
        where: { user: { id: args.userId } },
        select: { id: true },
      });
      console.log({ patient });
      if (!patient) {
        throw new Error(
          "No se encontró una ficha de paciente para este usuario"
        );
      }

      const patientId = patient.id;
      // Elegimos la carpeta según el tipo de documento médico
      const docType = (args.docType as DocumentType) ?? "OTHER";
      const folder = docType.toLowerCase(); // ej: "exam_report", "prescription"

      const storageKey = `${folder}/${Date.now()}-${args.filename}`;

      // 1) Creamos el attachment "físico" que apunta al archivo en S3

      const attachment = await prisma.attachment.create({
        data: {
          storageKey,
          fileName: args.filename,
          mimeType: args.mimeType ?? "application/pdf",
        },
      });

      // 2) Creamos el ClinicalDocument genérico que referencia a ese attachment
      await prisma.clinicalDocument.create({
        data: {
          patientId,
          docType,
          title: args.title,
          attachmentId: attachment.id,
        },
        include: {
          attachment: true,
        },
      });

      // 3) Siempre creamos un MedicalExam para obtener presignedUrl
      const medicalExam = await prisma.exam.create({
        data: {
          title: args.title,
          patientId,
          category: (args.category as any) ?? "OTHER",
          attachments: {
            connect: { id: attachment.id },
          },
        },
        include: {
          attachments: {
            take: 1,
            orderBy: { uploadedAt: "desc" },
          },
        },
      });

      return medicalExam;
    },
  })
);
