import { prisma } from "@medical-platform/core";
import { MessageDirection } from "@prisma/client";

export type ConversationMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Build conversation history for OpenAI context from database messages
 */
export async function buildConversationHistory(
  conversationId: string
): Promise<ConversationMessage[]> {
  const messages = await prisma.conversationMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 20, // Last 20 messages for context
  });

  const history: ConversationMessage[] = [];

  for (const msg of messages) {
    if (msg.direction === MessageDirection.INBOUND && msg.textBody) {
      history.push({
        role: "user",
        content: msg.textBody,
      });
    } else if (msg.direction === MessageDirection.OUTBOUND && msg.textBody) {
      history.push({
        role: "assistant",
        content: msg.textBody,
      });
    }
  }

  return history;
}
