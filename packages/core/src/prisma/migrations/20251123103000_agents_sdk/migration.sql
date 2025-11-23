-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('IN_PROGRESS', 'REQUIRES_ACTION', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Conversation"
ADD COLUMN     "openAiConversationId" TEXT;

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "openAiConversationId" TEXT NOT NULL,
    "responseId" TEXT,
    "status" "AgentRunStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "userMessage" TEXT,
    "lastOutput" TEXT,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "requestedToolCalls" JSONB,
    "submittedToolOutputs" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_openAiConversationId_key" ON "Conversation"("openAiConversationId");

-- CreateIndex
CREATE INDEX "AgentRun_conversationId_createdAt_idx" ON "AgentRun"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "AgentRun"
ADD CONSTRAINT "AgentRun_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

