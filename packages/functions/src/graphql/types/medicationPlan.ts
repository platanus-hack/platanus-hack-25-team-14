import { builder } from "@medical-platform/core";

builder.prismaObject("MedicationPlan", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    drugName: t.exposeString("drugName"),
    dose: t.exposeString("dose", { nullable: true }),
    frequency: t.exposeString("frequency", { nullable: true }),
    route: t.exposeString("route", { nullable: true }),
    startDate: t.expose("startDate", { type: "DateTime", nullable: true }),
    endDate: t.expose("endDate", { type: "DateTime", nullable: true }),
    isActive: t.exposeBoolean("isActive"),
    notes: t.exposeString("notes", { nullable: true }),
  }),
});


