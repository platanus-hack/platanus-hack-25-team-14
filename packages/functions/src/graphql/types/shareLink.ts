import { builder, prisma } from "@medical-platform/core";
import { randomBytes } from "crypto";

builder.prismaObject("ShareLink", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    token: t.exposeString("token"),
    purpose: t.exposeString("purpose"),
    patientId: t.exposeString("patientId"),
    patient: t.relation("patient"),
    includeBasicInfo: t.exposeBoolean("includeBasicInfo"),
    includeEmergencyInfo: t.exposeBoolean("includeEmergencyInfo"),
    includeConsultations: t.exposeBoolean("includeConsultations"),
    includeDiagnoses: t.exposeBoolean("includeDiagnoses"),
    includeExams: t.exposeBoolean("includeExams"),
    includeSurgeries: t.exposeBoolean("includeSurgeries"),
    includeVaccines: t.exposeBoolean("includeVaccines"),
    includeFamilyHistory: t.exposeBoolean("includeFamilyHistory"),
    includeAllergies: t.exposeBoolean("includeAllergies"),
    includeConditions: t.exposeBoolean("includeConditions"),
    includeMedications: t.exposeBoolean("includeMedications"),
    includeAnthropometrics: t.exposeBoolean("includeAnthropometrics"),
    expiresAt: t.expose("expiresAt", { type: "DateTime", nullable: true }),
    revokedAt: t.expose("revokedAt", { type: "DateTime", nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});

// List share links for a patient
builder.queryField("getPatientShareLinks", (t) =>
  t.prismaField({
    type: ["ShareLink"],
    args: {
      patientId: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args) =>
      prisma.shareLink.findMany({
        ...query,
        where: { patientId: args.patientId },
        orderBy: { createdAt: "desc" },
      }),
  }),
);

// Fetch a share link by token (for public view)
builder.queryField("getShareLink", (t) =>
  t.prismaField({
    type: "ShareLink",
    args: {
      token: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args) =>
      prisma.shareLink.findUniqueOrThrow({
        ...query,
        where: { token: args.token },
      }),
  }),
);

// Mutation to create a general-purpose share link
builder.mutationField("createGeneralShareLink", (t) =>
  t.prismaField({
    type: "ShareLink",
    args: {
      patientId: t.arg.string({ required: true }),
      expiresAt: t.arg({ type: "DateTime", required: false }),
      includeBasicInfo: t.arg.boolean({ required: false }),
      includeEmergencyInfo: t.arg.boolean({ required: false }),
      includeConsultations: t.arg.boolean({ required: false }),
      includeDiagnoses: t.arg.boolean({ required: false }),
      includeExams: t.arg.boolean({ required: false }),
      includeSurgeries: t.arg.boolean({ required: false }),
      includeVaccines: t.arg.boolean({ required: false }),
      includeFamilyHistory: t.arg.boolean({ required: false }),
      includeAllergies: t.arg.boolean({ required: false }),
      includeConditions: t.arg.boolean({ required: false }),
      includeMedications: t.arg.boolean({ required: false }),
      includeAnthropometrics: t.arg.boolean({ required: false }),
    },
    resolve: (query, _root, args) => {
      const token = randomBytes(16).toString("hex");

      return prisma.shareLink.create({
        ...query,
        data: {
          patientId: args.patientId,
          token,
          purpose: "GENERAL",
          includeBasicInfo: args.includeBasicInfo ?? true,
          includeEmergencyInfo: args.includeEmergencyInfo ?? false,
          includeConsultations: args.includeConsultations ?? false,
          includeDiagnoses: args.includeDiagnoses ?? false,
          includeExams: args.includeExams ?? false,
          includeSurgeries: args.includeSurgeries ?? false,
          includeVaccines: args.includeVaccines ?? false,
          includeFamilyHistory: args.includeFamilyHistory ?? false,
          includeAllergies: args.includeAllergies ?? false,
          includeConditions: args.includeConditions ?? false,
          includeMedications: args.includeMedications ?? false,
          includeAnthropometrics: args.includeAnthropometrics ?? false,
          expiresAt: args.expiresAt ?? null,
        },
      });
    },
  }),
);

// Mutation to create an emergency share link (no expiry by default)
builder.mutationField("createEmergencyShareLink", (t) =>
  t.prismaField({
    type: "ShareLink",
    args: {
      patientId: t.arg.string({ required: true }),
      includeBasicInfo: t.arg.boolean({ required: false }),
      includeEmergencyInfo: t.arg.boolean({ required: false }),
      includeAllergies: t.arg.boolean({ required: false }),
      includeConditions: t.arg.boolean({ required: false }),
      includeMedications: t.arg.boolean({ required: false }),
      includeAnthropometrics: t.arg.boolean({ required: false }),
    },
    resolve: (query, _root, args) => {
      const token = randomBytes(16).toString("hex");

      return prisma.shareLink.create({
        ...query,
        data: {
          patientId: args.patientId,
          token,
          purpose: "EMERGENCY",
          includeBasicInfo: args.includeBasicInfo ?? true,
          includeEmergencyInfo: args.includeEmergencyInfo ?? true,
          includeConsultations: false,
          includeDiagnoses: false,
          includeExams: false,
          includeSurgeries: false,
          includeVaccines: false,
          includeFamilyHistory: false,
          includeAllergies: args.includeAllergies ?? true,
          includeConditions: args.includeConditions ?? true,
          includeMedications: args.includeMedications ?? true,
          includeAnthropometrics: args.includeAnthropometrics ?? true,
          expiresAt: null,
        },
      });
    },
  }),
);


