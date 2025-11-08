
'use server';
/**
 * @fileOverview A tool-calling Genkit flow for handling customer chat conversations.
 *
 * This flow powers an AI assistant that can answer questions about products,
 * add items to the cart, and check on order status by using tools.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Product } from '@/lib/data';
import { ChatInput, ChatInputSchema, ChatOutput, ChatOutputSchema } from '../schemas/chat-schemas';

// Initialize outside the functions to reuse the instance
const firestore = getFirestore(initializeFirebase());

// --- Main exported function for the client ---
export async function chat(input: ChatInput): Promise<ChatOutput> {
  const result = await chatFlow(input);
  return result;
}


// --- AI Tools ---

const getProductInfoTool = ai.defineTool(
  {
    name: 'getProductInfo',
    description: 'Get details for a specific product, like its price, description, or stock level. Use this if a user asks a question about a particular product.',
    input: { schema: z.object({ name: z.string() }) },
    output: { schema: z.custom<Product>() },
  },
  async ({ name }) => {
    console.log(`[getProductInfoTool] Searching for product: ${name}`);
    const productsRef = collection(firestore, 'products');
    const q = query(productsRef, where('name', '==', name), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error(`Product "${name}" not found.`);
    }
    const product = snapshot.docs[0].data() as Product;
    product.id = snapshot.docs[0].id;
    return product;
  }
);

const addProductToCartTool = ai.defineTool(
  {
    name: 'addProductToCart',
    description: 'Adds a specified quantity of a product to the user\'s shopping cart. Use this when the user explicitly asks to add an item to their cart.',
    input: { schema: z.object({ productName: z.string(), quantity: z.number().default(1) }) },
    output: { schema: z.string() },
  },
  async ({ productName, quantity }, {
    userId
  }) => {
    console.log(`[addProductToCartTool] Adding ${quantity} of ${productName} to cart for user ${userId}`);
    if (!userId) {
      return 'I can\'t add items to the cart because I don\'t know who you are. Please log in first.';
    }

    const productsRef = collection(firestore, 'products');
    const q = query(productsRef, where('name', '==', productName), limit(1));
    const productSnap = await getDocs(q);

    if (productSnap.empty) {
      return `Sorry, I couldn't find a product named "${productName}".`;
    }
    const productId = productSnap.docs[0].id;

    const cartDocRef = doc(firestore, 'users', userId, 'cart', productId);
    await setDoc(cartDocRef, { quantity, addedAt: serverTimestamp() }, { merge: true });

    return `Successfully added ${quantity} of "${productName}" to your cart.`;
  }
);

const getOrderStatusTool = ai.defineTool(
  {
    name: 'getOrderStatus',
    description: 'Retrieves the status of the user\'s most recent order.',
    input: { schema: z.object({}) }, // No input needed
    output: { schema: z.string() },
  },
  async (_, {
    userId
  }) => {
    console.log(`[getOrderStatusTool] Getting latest order status for user ${userId}`);
    if (!userId) {
      return 'I can\'t check your order status because I don\'t know who you are. Please log in first.';
    }

    const ordersRef = collection(firestore, 'users', userId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return "It looks like you haven't placed any orders yet.";
    }

    const latestOrder = snapshot.docs[0].data();
    return `Your most recent order (#${snapshot.docs[0].id.substring(0, 6)}) has a status of: **${latestOrder.status}**.`;
  }
);


// --- AI Flow Definition ---
const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { userId, history } = input;

    const llmResponse = await ai.generate({
      prompt: {
        text: '', // Prompt comes from system instruction
        context: history,
      },
      model: 'googleai/gemini-2.5-flash',
      tools: [getProductInfoTool, addProductToCartTool, getOrderStatusTool],
      system: `You are a friendly and helpful customer service assistant for an online Nigerian grocery store called BeautifulSoup&Food.

      Your goal is to answer customer questions and help them with their shopping. Be conversational and welcoming.

      You have access to several tools to help you answer questions. Use them when appropriate.
      - If the user asks about a specific product, use the \`getProductInfo\` tool.
      - If the user wants to add an item to their cart, use the \`addProductToCart\` tool.
      - If the user asks about their order status, use the \`getOrderStatus\` tool.
      
      When presenting information like product prices, always include the currency symbol (₦).

      If you can't answer a question with your tools or general knowledge, politely tell the user that you will have a team member get back to them shortly. Do not make up information.`,
      context: { userId }, // Pass userId to the tool context
    });

    return { response: llmResponse.text };
  }
);
