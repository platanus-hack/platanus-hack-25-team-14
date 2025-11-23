import { builder, prisma } from "@medical-platform/core";

builder.prismaObject("VaccineRecord", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    vaccineName: t.exposeString("vaccineName"),
    doseNumber: t.exposeInt("doseNumber", { nullable: true }),
    totalDosesPlanned: t.exposeInt("totalDosesPlanned", { nullable: true }),
    date: t.expose("date", { type: "DateTime", nullable: true }),
    lotNumber: t.exposeString("lotNumber", { nullable: true }),
    facility: t.exposeString("facility", { nullable: true }),
    notes: t.exposeString("notes", { nullable: true }),
  }),
});

builder.queryField("getPatientVaccines", (t) =>
  t.prismaField({
    type: ["VaccineRecord"],
    args: {
      patientId: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args) =>
      prisma.vaccineRecord.findMany({
        ...query,
        where: { patientId: args.patientId },
        orderBy: { date: "desc" },
      }),
  }),
);


