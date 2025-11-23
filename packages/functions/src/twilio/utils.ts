import type { APIGatewayProxyEventV2 } from "aws-lambda";
import type { TwilioWebhookPayload } from "./types";

export function normalizePhoneNumber(input: string): string {
  return input.replace(/^whatsapp:/, "").replace(/[^\d+]/g, "");
}

export function parseFormBody(body: Buffer): Record<string, string> {
  const params = new URLSearchParams(body.toString("utf8"));
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

export function buildRequestUrl(event: APIGatewayProxyEventV2): string {
  const { requestContext, rawPath, rawQueryString } = event;
  const base = `https://${requestContext.domainName}${rawPath}`;
  return rawQueryString ? `${base}?${rawQueryString}` : base;
}

export function extractMediaFromPayload(payload: TwilioWebhookPayload) {
  const numMedia = Number(payload.NumMedia ?? "0");
  if (Number.isNaN(numMedia) || numMedia <= 0) {
    return null;
  }

  const url = payload["MediaUrl0"];
  if (!url) {
    return null;
  }

  const mimeType = payload["MediaContentType0"];
  const fileName = deriveFileName(mimeType);
  const mediaSid = extractMediaSid(url);

  return {
    url,
    mimeType,
    fileName,
    mediaSid,
  };
}

function deriveFileName(mimeType?: string) {
  if (!mimeType) return undefined;
  const extension = mimeType.split("/")[1];
  if (!extension) return undefined;
  return `document.${extension}`;
}

function extractMediaSid(url: string) {
  const match = url.match(/Media\/([^\/?]+)/);
  return match?.[1];
}
