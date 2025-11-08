import { z } from 'zod';

// --- Input and Output Schemas ---
const ChatHistorySchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({ text: z.string() })),
  })
);

export const ChatInputSchema = z.object({
  userId: z.string().describe('The unique ID of the user who is chatting.'),
  history: ChatHistorySchema.describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
