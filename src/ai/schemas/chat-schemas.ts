import { z } from 'zod';

export const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({ text: z.string() })),
  })).describe('The conversation history.'),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    stock: z.number(),
  })).describe('List of available products in the store.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;
