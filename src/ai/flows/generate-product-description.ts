'use server';
/**
 * @fileOverview A Genkit flow for generating product descriptions.
 *
 * This file defines a flow that takes product keywords and generates a compelling
 * product description using a generative AI model.
 *
 * - generateProductDescription - The main function that invokes the flow.
 * - ProductDescriptionInput - The Zod schema for the input.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ProductDescriptionInputSchema = z.object({
  keywords: z
    .string()
    .describe('A comma-separated list of keywords for the product (e.g., product name, category).'),
});
export type ProductDescriptionInput = z.infer<typeof ProductDescriptionInputSchema>;

export async function generateProductDescription(input: ProductDescriptionInput): Promise<string> {
  const result = await generateProductDescriptionFlow(input);
  return result;
}

const prompt = ai.definePrompt(
    {
        name: 'productDescriptionPrompt',
        input: { schema: ProductDescriptionInputSchema },
        prompt: `You are an expert e-commerce copywriter for a Nigerian food store.

        Generate a compelling, SEO-friendly product description based on the following keywords.
        The description should be engaging, highlight the authentic flavors, and entice customers to buy.
        Do not include a title or header. Only output the description text itself.
        
        Keywords: {{{keywords}}}`,
    }
);

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: ProductDescriptionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const llmResponse = await prompt(input);
    return llmResponse.text;
  }
);
