import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { Sex, BloodType } from "@prisma/client";
import { prisma } from "./db";

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: {
    // Define your context type here (e.g., auth info)
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
    // Use "dmmf" if you want to expose all fields automatically (optional but handy)
    // exposeDescriptions: true,
    // filterConnectionTotalCount: true,
  },
});

builder.scalarType("DateTime", {
  serialize: (n) => new Date(n).toISOString(),
  parseValue: (n) => new Date(n as string),
});

// Prisma enums exposed as GraphQL enums
builder.enumType("Sex", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Sex as any,
});

builder.enumType("BloodType", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: BloodType as any,
});

// Define the query type root
builder.queryType({});
builder.mutationType({});
