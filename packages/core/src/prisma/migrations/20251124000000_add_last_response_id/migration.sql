-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN "lastOpenAiResponseId" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "Conversation"."lastOpenAiResponseId" IS 'Tracking del último response ID de OpenAI para encadenar conversaciones usando previous_response_id';

