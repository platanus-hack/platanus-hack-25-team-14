import { builder } from "@medical-platform/core";

builder.prismaObject("Diagnosis", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    code: t.exposeString("code", { nullable: true }),
    description: t.exposeString("description"),
    isPrimary: t.exposeBoolean("isPrimary"),
    isChronic: t.exposeBoolean("isChronic"),
    notes: t.exposeString("notes", { nullable: true }),
  }),
});


