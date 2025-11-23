import { builder, prisma } from "@medical-platform/core";

builder.prismaObject("AnthropometricRecord", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    date: t.expose("date", { type: "DateTime" }),
    heightCm: t.exposeFloat("heightCm", { nullable: true }),
    weightKg: t.exposeFloat("weightKg", { nullable: true }),
    bmi: t.exposeFloat("bmi", { nullable: true }),
    notes: t.exposeString("notes", { nullable: true }),
  }),
});

// Campo derivado para obtener el último registro antropométrico de un paciente
builder.prismaObjectFields("Patient", (t) => ({
  latestAnthropometric: t.field({
    type: "AnthropometricRecord",
    nullable: true,
    resolve: (patient) =>
      prisma.anthropometricRecord.findFirst({
        where: { patientId: patient.id },
        orderBy: { date: "desc" },
      }),
  }),
}));


