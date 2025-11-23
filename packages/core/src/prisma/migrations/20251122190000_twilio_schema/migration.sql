-- Drop old Kapso-specific tables and enums
DROP TABLE IF EXISTS "KapsoWebhookEvent" CASCADE;
DROP TABLE IF EXISTS "KapsoMessage" CASCADE;
DROP TABLE IF EXISTS "KapsoUploadIntent" CASCADE;
DROP TABLE IF EXISTS "KapsoConversation" CASCADE;
DROP TYPE IF EXISTS "KapsoConversationStatus" CASCADE;
DROP TYPE IF EXISTS "KapsoMessageDirection" CASCADE;
DROP TYPE IF EXISTS "KapsoUploadIntentStatus" CASCADE;
DROP TYPE IF EXISTS "KapsoIntakeField" CASCADE;

-- CreateEnum
CREATE TYPE "ConversationProvider" AS ENUM ('TWILIO_WHATSAPP');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'HANDOFF', 'CLOSED');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "UploadIntentStatus" AS ENUM ('COLLECTING', 'READY', 'DISPATCHED', 'FAILED');

-- CreateEnum
CREATE TYPE "IntakeField" AS ENUM ('DOCUMENT_TYPE', 'DOCUMENT_DATE', 'DOCUMENT_TITLE', 'DOCUMENT_FILE');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "provider" "ConversationProvider" NOT NULL,
    "providerConversationId" TEXT NOT NULL,
    "fromPhoneNumber" TEXT NOT NULL,
    "toPhoneNumber" TEXT,
    "contactName" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastMessageAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "providerMessageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "messageType" TEXT NOT NULL,
    "textBody" TEXT,
    "mediaUrl" TEXT,
    "mediaMeta" JSONB,
    "rawPayload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerStatus" TEXT,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadIntent" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "status" "UploadIntentStatus" NOT NULL DEFAULT 'COLLECTING',
    "awaitingField" "IntakeField",
    "documentType" TEXT,
    "documentDateText" TEXT,
    "documentTitle" TEXT,
    "documentSourceUrl" TEXT,
    "documentMimeType" TEXT,
    "documentFileName" TEXT,
    "providerMediaId" TEXT,
    "documentMessageId" TEXT,
    "metadata" JSONB,
    "dispatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT,

    CONSTRAINT "UploadIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationWebhookEvent" (
    "id" TEXT NOT NULL,
    "providerMessageId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_providerConversationId_key" ON "Conversation"("providerConversationId");

-- CreateIndex
CREATE INDEX "Conversation_providerConversationId_idx" ON "Conversation"("providerConversationId");

-- CreateIndex
CREATE INDEX "Conversation_fromPhoneNumber_idx" ON "Conversation"("fromPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMessage_providerMessageId_key" ON "ConversationMessage"("providerMessageId");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_direction_idx" ON "ConversationMessage"("conversationId", "direction");

-- CreateIndex
CREATE INDEX "ConversationMessage_receivedAt_idx" ON "ConversationMessage"("receivedAt");

-- CreateIndex
CREATE INDEX "UploadIntent_conversationId_status_idx" ON "UploadIntent"("conversationId", "status");

-- CreateIndex
CREATE INDEX "UploadIntent_patientId_idx" ON "UploadIntent"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationWebhookEvent_providerMessageId_key" ON "ConversationWebhookEvent"("providerMessageId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadIntent" ADD CONSTRAINT "UploadIntent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadIntent" ADD CONSTRAINT "UploadIntent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

