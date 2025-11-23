import { Twilio } from "twilio";
import { Resource } from "sst";

type SendWhatsAppMessageInput = {
  to: string;
  body: string;
  mediaUrl?: string;
};

type DownloadedMedia = {
  buffer: Buffer;
  contentType?: string;
  contentLength?: number;
  suggestedFileName?: string;
};

function getSecretValue(
  key: "TwilioAccountSid" | "TwilioAuthToken" | "TwilioWhatsappFrom"
) {
  try {
    const table = Resource as unknown as Record<
      string,
      { value: string } | undefined
    >;
    return table[key]?.value;
  } catch {
    return undefined;
  }
}

const accountSid =
  getSecretValue("TwilioAccountSid") ??
  process.env.TWILIO_ACCOUNT_SID ??
  process.env.TWILIO_SID;
const authToken =
  getSecretValue("TwilioAuthToken") ??
  process.env.TWILIO_AUTH_TOKEN ??
  process.env.TWILIO_TOKEN;
const whatsappFrom =
  getSecretValue("TwilioWhatsappFrom") ??
  process.env.TWILIO_WHATSAPP_FROM ??
  process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !whatsappFrom) {
  throw new Error(
    "Twilio configuration missing. Set TwilioAccountSid, TwilioAuthToken, and TwilioWhatsappFrom secrets."
  );
}

const twilioClient = new Twilio(accountSid, authToken);

export async function sendWhatsAppMessage(input: SendWhatsAppMessageInput) {
  return twilioClient.messages.create({
    from: whatsappFrom,
    to: input.to,
    body: input.body,
    ...(input.mediaUrl ? { mediaUrl: [input.mediaUrl] } : {}),
  });
}

export async function downloadMedia(url: string): Promise<DownloadedMedia> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${accountSid}:${authToken}`
      ).toString("base64")}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Twilio media download failed (${response.status}): ${
        text || response.statusText
      }`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") ?? undefined;
  const contentLengthHeader = response.headers.get("content-length");

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
    contentLength: contentLengthHeader
      ? Number(contentLengthHeader)
      : undefined,
    suggestedFileName: deriveFileName(contentType),
  };
}

function deriveFileName(contentType?: string) {
  if (!contentType) return undefined;
  const extension = contentType.split("/")[1];
  return extension ? `document.${extension}` : undefined;
}
