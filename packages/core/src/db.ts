import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import { Resource } from "sst";

const envFiles = [".env.local", ".env", "packages/core/.env"].map((file) =>
  resolve(process.cwd(), file)
);

envFiles.push(resolve(__dirname, "../.env"));

for (const file of envFiles) {
  if (existsSync(file)) {
    loadEnv({ path: file, override: false });
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const getDatabaseUrl = (): string => {
  try {
    const table = Resource as unknown as Record<
      string,
      { value: string } | undefined
    >;
    const sstUrl = table.DatabaseUrl?.value;
    if (sstUrl) return sstUrl;
  } catch (e) {
    // SST Resource not available, fall through
  }

  const envUrl =
    "postgresql://neondb_owner:npg_KJLsXR4pi2Mq@ep-wispy-unit-ah0auv1b-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  if (envUrl) return envUrl;

  // During Next.js build phase only, Prisma doesn't actually connect, just validates the URL format
  // Provide a dummy connection string to satisfy Prisma's validation
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NODE_ENV === "production"
  ) {
    return "postgresql://neondb_owner:npg_KJLsXR4pi2Mq@ep-wispy-unit-ah0auv1b-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  }

  throw new Error("DATABASE_URL is required but not set");
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_KJLsXR4pi2Mq@ep-wispy-unit-ah0auv1b-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
