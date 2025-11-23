/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "medical-platform",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const databaseUrl = new sst.Secret("DatabaseUrl");
    const betterAuthSecret = new sst.Secret("BetterAuthSecret");
    const googleClientId = new sst.Secret("GoogleClientId");
    const googleClientSecret = new sst.Secret("GoogleClientSecret");
    const twilioAccountSid = new sst.Secret("TwilioAccountSid");
    const twilioAuthToken = new sst.Secret("TwilioAuthToken");
    const twilioWhatsappFrom = new sst.Secret("TwilioWhatsappFrom");
    const openAIApiKey = new sst.Secret("OpenAIApiKey");
    const anthropicApiKey = new sst.Secret("AnthropicApiKey");
    const examsBucket = new sst.aws.Bucket("Exams");

    // Lambda con URL para llamar desde Postman
    const documentProcessor = new sst.aws.Function("DocumentProcessor", {
      handler: "packages/functions/src/document-processor.handler",
      url: true, // 👈 Esto te da una URL HTTP
      link: [examsBucket, databaseUrl, anthropicApiKey],
      timeout: "5 minutes",
      memory: "1024 MB",
      nodejs: {
        install: ["@prisma/client", "prisma"],
      },
    });
    // Lambda que se activa cuando se agregan archivos al bucket
    examsBucket.notify({
      notifications: [
        {
          name: "DocumentProcessorSubscriber",
          function: {
            handler: "packages/functions/src/document-processor.handler",
            link: [examsBucket, databaseUrl, anthropicApiKey],
            timeout: "5 minutes",
            memory: "1024 MB",
            nodejs: {
              install: ["@prisma/client", "prisma"],
            },
          },
          events: ["s3:ObjectCreated:*"],
        },
      ],
    });

    // 6. Backend API (GraphQL running on Lambda)
    const api = new sst.aws.Function("GraphqlApi", {
      handler: "packages/functions/src/api.handler",
      url: true,
      link: [examsBucket, databaseUrl],
      environment: {
        // NODE_ENV: "production",
      },
      nodejs: {
        install: ["@prisma/client", "prisma"],
        esbuild: {
          // keep Prisma out of the bundle, use node_modules at runtime
          external: ["@prisma/client", "prisma"],
        },
      },
    });

    const twilioWebhook = new sst.aws.Function("TwilioWebhook", {
      handler: "packages/functions/src/twilio/webhook.handler",
      url: true,
      link: [
        databaseUrl,
        examsBucket,
        twilioAccountSid,
        twilioAuthToken,
        twilioWhatsappFrom,
        openAIApiKey,
      ],
      nodejs: {
        // very important for native deps like Prisma
        install: ["@prisma/client", "prisma"],
        esbuild: {
          // keep Prisma out of the bundle, use node_modules at runtime
          external: ["@prisma/client", "prisma"],
        },
      },

      permissions: [
        {
          actions: ["s3:PutObject", "s3:GetObject"],
          resources: [
            examsBucket.arn,
            examsBucket.arn.apply((arn) => `${arn}/*`),
          ],
        },
      ],
    });

    const web = new sst.aws.Nextjs("Web", {
      path: "apps/web",
      link: [
        api,
        databaseUrl,
        betterAuthSecret,
        googleClientId,
        googleClientSecret,
      ],
      environment: {
        NEXT_PUBLIC_API_URL: api.url,
      },
    });

    return {
      api: api.url,
      web: web.url,
      twilioWebhook: twilioWebhook.url,
      examsBucket: examsBucket.name,
      documentProcessor: documentProcessor.url, // 👈 URL para Postman
    };
  },
});
