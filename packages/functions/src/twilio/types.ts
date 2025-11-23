export type TwilioWebhookPayload = Record<string, string | undefined>;

export type TwilioMediaCapture = {
  url: string;
  mimeType?: string;
  fileName?: string;
  mediaSid?: string;
  isAudio?: boolean;
};
