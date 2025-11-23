import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // Usa el schema generado localmente para consistencia en el monorepo
  schema: "../../packages/functions/schema.graphql",
  documents: ["app/**/*.tsx", "app/**/*.ts"],
  ignoreNoDocuments: true,
  generates: {
    "./gql/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
};

export default config;

