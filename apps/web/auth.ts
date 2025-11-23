import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../packages/core/src/db";

const getSecret = (key: string): string => {
  try {
    const resourceKey = `SST_RESOURCE_${key}`;
    const resourceValue = process.env[resourceKey];
    if (resourceValue) {
      const parsed = JSON.parse(resourceValue);
      return parsed.value;
    }
  } catch (e) {
    console.error(`Failed to get SST resource ${key}:`, e);
  }
  return process.env[key] || "";
};

const getBaseURL = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://hackathon-rust-nine.vercel.app";
  }
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
};

const secret = getSecret("BetterAuthSecret");
const googleClientId = getSecret("GoogleClientId");
const googleClientSecret = getSecret("GoogleClientSecret");

if (!secret) {
  console.error("BetterAuthSecret is required but not set");
}

const baseURL = getBaseURL();
const trustedOrigins = [
  baseURL,
  process.env.NEXT_PUBLIC_API_URL,
  "https://hackathon-rust-nine.vercel.app",
  "http://localhost:3000",
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
].filter(Boolean) as string[];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL,
  secret: secret || "dummy-secret-for-build",
  trustedOrigins: [...new Set(trustedOrigins)],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
});
