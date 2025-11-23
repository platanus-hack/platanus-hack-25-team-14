import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  ConversationProvider,
  ConversationStatus,
  MessageDirection,
  Prisma,
} from "@prisma/client";
import { prisma } from "@medical-platform/core";
import { Resource } from "sst";
import { validateRequest } from "twilio/lib/webhooks/webhooks";
import { handleTwilioInboundAgent } from "./agent";
import type { TwilioWebhookPayload } from "./types";
import { captureMediaFromMessage } from "./uploadDispatcher";
import { buildRequestUrl, normalizePhoneNumber, parseFormBody } from "./utils";

function getSecretValue(key: "TwilioAuthToken") {
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

const authToken =
  getSecretValue("TwilioAuthToken") ??
  process.env.TWILIO_AUTH_TOKEN ??
  process.env.TWILIO_TOKEN;

if (!authToken) {
  throw new Error(
    "Twilio webhook requires TwilioAuthToken secret or TWILIO_AUTH_TOKEN env var."
  );
}

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.requestContext.http.method === "GET") {
    return {
      statusCode: 200,
      body: "Twilio webhook ready",
    };
  }

  const rawBody = event.body
    ? Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
    : Buffer.alloc(0);

  const signature =
    event.headers["x-twilio-signature"] ??
    event.headers["X-Twilio-Signature"] ??
    undefined;
  const url = buildRequestUrl(event);
  const params = parseFormBody(rawBody);

  if (!signature || !validateRequest(authToken, signature, url, params)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "invalid_signature" }),
    };
  }

  const payload = params as TwilioWebhookPayload;
  const messageSid = payload.MessageSid;
  if (!messageSid) {
    return {
      statusCode: 200,
      body: JSON.stringify({ ignored: true }),
    };
  }

  const smsStatus = (
    payload.SmsStatus ??
    payload.MessageStatus ??
    "received"
  ).toLowerCase();
  const eventName = `twilio.${smsStatus}`;

  const alreadyProcessed = await recordWebhookEvent(messageSid, eventName);
  if (!alreadyProcessed) {
    return {
      statusCode: 200,
      body: JSON.stringify({ duplicate: true }),
    };
  }

  if (smsStatus !== "received") {
    return {
      statusCode: 200,
      body: JSON.stringify({ ignored: true }),
    };
  }

  await processInboundMessage(payload);

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};

async function processInboundMessage(payload: TwilioWebhookPayload) {
  const from = payload.From;
  if (!from) return;

  const normalizedPhone = normalizePhoneNumber(from);
  const patient = await prisma.patient.findFirst({
    where: {
      OR: [{ phone: normalizedPhone }, { phone: from }],
    },
  });

  const conversation = await prisma.conversation.upsert({
    where: { providerConversationId: from },
    update: {
      fromPhoneNumber: from,
      toPhoneNumber: payload.To ?? undefined,
      contactName: payload.ProfileName ?? undefined,
      status: ConversationStatus.ACTIVE,
      lastMessageAt: new Date(),
      metadata: payload,
      ...(patient?.id ? { patient: { connect: { id: patient.id } } } : {}),
    },
    create: {
      provider: ConversationProvider.TWILIO_WHATSAPP,
      providerConversationId: from,
      fromPhoneNumber: from,
      toPhoneNumber: payload.To ?? undefined,
      contactName: payload.ProfileName ?? undefined,
      status: ConversationStatus.ACTIVE,
      lastMessageAt: new Date(),
      metadata: payload,
      ...(patient?.id ? { patient: { connect: { id: patient.id } } } : {}),
    },
  });

  await prisma.conversationMessage.upsert({
    where: { providerMessageId: payload.MessageSid! },
    update: {
      conversation: { connect: { id: conversation.id } },
      rawPayload: payload as Prisma.JsonObject,
      textBody: payload.Body ?? undefined,
      messageType: determineMessageType(payload),
      direction: MessageDirection.INBOUND,
      mediaUrl: payload["MediaUrl0"] ?? undefined,
      mediaMeta: captureMediaFromMessage(payload) ?? undefined,
      receivedAt: new Date(),
      providerStatus: payload.SmsStatus ?? payload.MessageStatus ?? undefined,
    },
    create: {
      providerMessageId: payload.MessageSid!,
      conversationId: conversation.id,
      rawPayload: payload as Prisma.JsonObject,
      textBody: payload.Body ?? undefined,
      messageType: determineMessageType(payload),
      direction: MessageDirection.INBOUND,
      mediaUrl: payload["MediaUrl0"] ?? undefined,
      mediaMeta: captureMediaFromMessage(payload) ?? undefined,
      receivedAt: new Date(),
      providerStatus: payload.SmsStatus ?? payload.MessageStatus ?? undefined,
    },
  });

  await handleTwilioInboundAgent({
    conversation,
    payload,
  });
}

function determineMessageType(payload: TwilioWebhookPayload) {
  const numMedia = Number(payload.NumMedia ?? "0");
  return !Number.isNaN(numMedia) && numMedia > 0 ? "media" : "text";
}

async function recordWebhookEvent(
  providerMessageId: string,
  eventName: string
) {
  try {
    await prisma.conversationWebhookEvent.create({
      data: {
        providerMessageId,
        eventName,
      },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return false;
    }
    throw error;
  }
}
