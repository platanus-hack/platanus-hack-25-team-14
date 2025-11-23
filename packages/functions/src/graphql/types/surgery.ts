import { builder, prisma } from "@medical-platform/core";

builder.prismaObject("Surgery", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    date: t.expose("date", { type: "DateTime", nullable: true }),
    hospital: t.exposeString("hospital", { nullable: true }),
    doctorName: t.exposeString("doctorName", { nullable: true }),
    notes: t.exposeString("notes", { nullable: true }),
  }),
});

builder.queryField("getPatientSurgeries", (t) =>
  t.prismaField({
    type: ["Surgery"],
    args: {
      patientId: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args) =>
      prisma.surgery.findMany({
        ...query,
        where: { patientId: args.patientId },
        orderBy: { date: "desc" },
      }),
  }),
);


