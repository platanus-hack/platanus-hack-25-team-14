import { builder } from "@medical-platform/core";

builder.prismaObject("Allergy", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    substance: t.exposeString("substance"),
    reaction: t.exposeString("reaction", { nullable: true }),
    isMedication: t.exposeBoolean("isMedication"),
    isSevere: t.exposeBoolean("isSevere"),
    notes: t.exposeString("notes", { nullable: true }),
  }),
});


