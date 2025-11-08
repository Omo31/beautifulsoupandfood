import { z } from 'zod';

export const ProductDescriptionInputSchema = z.object({
  keywords: z
    .string()
    .describe('A comma-separated list of keywords for the product (e.g., product name, category).'),
});
export type ProductDescriptionInput = z.infer<typeof ProductDescriptionInputSchema>;
