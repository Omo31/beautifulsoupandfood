'use server';
/**
 * @fileOverview A Genkit flow for handling customer chat conversations.
 *
 * This flow powers an AI assistant that can answer questions about products.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ChatInputSchema, type ChatInput } from '@/ai/schemas/chat-schemas';


export async function chat(input: ChatInput): Promise<string> {
  const result = await chatFlow(input);
  return result;
}

const prompt = ai.definePrompt(
  {
    name: 'chatPrompt',
    input: { schema: ChatInputSchema },
    prompt: `You are a friendly and helpful customer service assistant for an online Nigerian grocery store called BeautifulSoup&Food.

    Your goal is to answer customer questions and help them find products. Be conversational and welcoming.

    Here is the list of products available in the store:
    {{#each products}}
    - Name: {{name}}
      - Description: {{description}}
      - Price: ₦{{price}}
      - Category: {{category}}
      - Stock: {{stock}}
    {{/each}}

    Use the product information above to answer any questions the user has.
    If a user asks a question you cannot answer with the provided information, or if they ask to speak to a human, politely tell them that you will have a team member get back to them shortly.
    `,
  }
);


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { history, products } = input;
    
    const llmResponse = await ai.generate({
      prompt: {
        text: prompt.prompt,
        context: history,
      },
      history,
      config: {
        // Pass the product data to the prompt template
        templateData: { products },
      },
      model: 'googleai/gemini-2.5-flash',
    });
    
    return llmResponse.text;
  }
);
