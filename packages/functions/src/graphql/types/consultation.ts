import { builder, prisma } from "@medical-platform/core";

builder.prismaObject("Consultation", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    date: t.expose("date", { type: "DateTime" }),
    facilityName: t.exposeString("facilityName", { nullable: true }),
    doctorName: t.exposeString("doctorName", { nullable: true }),
    specialty: t.exposeString("specialty", { nullable: true }),
    reason: t.exposeString("reason", { nullable: true }),
    notes: t.exposeString("notes", { nullable: true }),
    diagnoses: t.relation("diagnoses"),
  }),
});

// Consultations for a specific patient
builder.queryField("getPatientConsultations", (t) =>
  t.prismaField({
    type: ["Consultation"],
    args: {
      patientId: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args) =>
      prisma.consultation.findMany({
        ...query,
        where: { patientId: args.patientId },
        orderBy: { date: "desc" },
      }),
  })
);
