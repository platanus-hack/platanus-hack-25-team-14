import { builder, prisma } from "@medical-platform/core";

builder.prismaObject("Patient", {
  // Explicit any to avoid implicit-any lint while keeping config simple
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    fullName: t.exposeString("fullName"),
    documentId: t.exposeString("documentId", { nullable: true }),
    email: t.exposeString("email", { nullable: true }),
    phone: t.exposeString("phone", { nullable: true }),
    sex: t.expose("sex", { type: "Sex", nullable: true }),
    dateOfBirth: t.expose("dateOfBirth", { type: "DateTime", nullable: true }),
    bloodType: t.expose("bloodType", { type: "BloodType", nullable: true }),
    emergencyNotes: t.exposeString("emergencyNotes", { nullable: true }),
    emergencyContactName: t.exposeString("emergencyContactName", {
      nullable: true,
    }),
    emergencyContactPhone: t.exposeString("emergencyContactPhone", {
      nullable: true,
    }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    exams: t.relation("exams"),
    allergies: t.relation("allergies"),
    conditions: t.relation("conditions"),
    medicationPlans: t.relation("medicationPlans"),
    consultations: t.relation("consultations"),
    surgeries: t.relation("surgeries"),
    vaccines: t.relation("vaccines"),
  }),
});

builder.queryField("getPatient", (t) =>
  t.prismaField({
    type: "Patient",
    args: {
      id: t.arg.string({ required: true }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: (query, _root, args): any =>
      prisma.patient.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      }),
  })
);

// Obtener Patient a partir de userId (para home autenticado).
// En el futuro, el userId debería venir del contexto de autenticación
// (por ejemplo, un JWT), y esta query podría renombrarse a getMyPatient
// sin argumentos.
builder.queryField("getPatientByUser", (t) =>
  t.prismaField({
    type: "Patient",
    nullable: true,
    args: {
      userId: t.arg.string({ required: true }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: (query, _root, args): any =>
      prisma.patient.findFirst({
        ...query,
        where: { userId: args.userId },
      }),
  })
);
