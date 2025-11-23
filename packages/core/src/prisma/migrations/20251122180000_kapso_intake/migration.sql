-- CreateEnum
CREATE TYPE "KapsoConversationStatus" AS ENUM ('ACTIVE', 'HANDOFF', 'CLOSED');

-- CreateEnum
CREATE TYPE "KapsoMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "KapsoUploadIntentStatus" AS ENUM ('COLLECTING', 'READY', 'DISPATCHED', 'FAILED');

-- CreateEnum
CREATE TYPE "KapsoIntakeField" AS ENUM ('DOCUMENT_TYPE', 'DOCUMENT_DATE', 'DOCUMENT_TITLE', 'DOCUMENT_FILE');

-- CreateTable
CREATE TABLE "KapsoConversation" (
    "id" TEXT NOT NULL,
    "kapsoConversationId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "phoneNumberId" TEXT,
    "contactName" TEXT,
    "status" "KapsoConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastMessageAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT,

    CONSTRAINT "KapsoConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KapsoMessage" (
    "id" TEXT NOT NULL,
    "kapsoMessageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" "KapsoMessageDirection" NOT NULL,
    "messageType" TEXT NOT NULL,
    "textBody" TEXT,
    "mediaUrl" TEXT,
    "mediaMeta" JSONB,
    "rawPayload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kapsoProcessingStatus" TEXT,

    CONSTRAINT "KapsoMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KapsoUploadIntent" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "status" "KapsoUploadIntentStatus" NOT NULL DEFAULT 'COLLECTING',
    "awaitingField" "KapsoIntakeField",
    "documentType" TEXT,
    "documentDateText" TEXT,
    "documentTitle" TEXT,
    "documentSourceUrl" TEXT,
    "documentMimeType" TEXT,
    "documentFileName" TEXT,
    "kapsoMediaId" TEXT,
    "documentMessageId" TEXT,
    "metadata" JSONB,
    "dispatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT,

    CONSTRAINT "KapsoUploadIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KapsoWebhookEvent" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KapsoWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KapsoConversation_kapsoConversationId_key" ON "KapsoConversation"("kapsoConversationId");

-- CreateIndex
CREATE INDEX "KapsoConversation_kapsoConversationId_idx" ON "KapsoConversation"("kapsoConversationId");

-- CreateIndex
CREATE INDEX "KapsoConversation_phoneNumber_idx" ON "KapsoConversation"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "KapsoMessage_kapsoMessageId_key" ON "KapsoMessage"("kapsoMessageId");

-- CreateIndex
CREATE INDEX "KapsoMessage_conversationId_direction_idx" ON "KapsoMessage"("conversationId", "direction");

-- CreateIndex
CREATE INDEX "KapsoMessage_receivedAt_idx" ON "KapsoMessage"("receivedAt");

-- CreateIndex
CREATE INDEX "KapsoUploadIntent_conversationId_status_idx" ON "KapsoUploadIntent"("conversationId", "status");

-- CreateIndex
CREATE INDEX "KapsoUploadIntent_patientId_idx" ON "KapsoUploadIntent"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "KapsoWebhookEvent_idempotencyKey_key" ON "KapsoWebhookEvent"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "KapsoConversation" ADD CONSTRAINT "KapsoConversation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KapsoMessage" ADD CONSTRAINT "KapsoMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "KapsoConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KapsoUploadIntent" ADD CONSTRAINT "KapsoUploadIntent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "KapsoConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KapsoUploadIntent" ADD CONSTRAINT "KapsoUploadIntent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

