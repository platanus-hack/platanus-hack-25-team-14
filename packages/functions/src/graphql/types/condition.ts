import { builder } from "@medical-platform/core";

builder.prismaObject("Condition", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    // Exponemos status como string simple para evitar depender de un enum GraphQL extra
    status: t.string({
      resolve: (condition) => condition.status,
    }),
    diagnosedAt: t.expose("diagnosedAt", { type: "DateTime", nullable: true }),
    resolvedAt: t.expose("resolvedAt", { type: "DateTime", nullable: true }),
    notes: t.exposeString("notes", { nullable: true }),
  }),
});
