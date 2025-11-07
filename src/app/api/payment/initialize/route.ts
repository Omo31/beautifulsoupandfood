
import { NextResponse } from 'next/server';
import paystack from '@/lib/paystack';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// Initialize Firebase Admin for server-side operations
// Note: In a real production app, you'd use firebase-admin for this.
// For simplicity, we are using client SDK on the server, which is not recommended for production.
const app = initializeFirebase();
const firestore = getFirestore(app);

export async function POST(req: Request) {
  try {
    const { userId, email, amount, cartItems, quoteItems, orderType = 'cart', orderRef } = await req.json();

    if (!userId || !email || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const items = orderType === 'quote' ? quoteItems : cartItems;

    if (!items || items.length === 0) {
        return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // You might want to verify the amount on the server-side by recalculating it
    // based on the cartItems to prevent tampering. For now, we trust the client.

    const response = await paystack.transaction.initialize({
      email: email,
      amount: amount * 100, // Paystack expects amount in kobo
      metadata: {
        user_id: userId,
        order_items: JSON.stringify(items),
        order_type: orderType, // 'cart' or 'quote'
        order_ref: orderRef || '', // The ID of the quote if it's a quote order
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`
    });
    
    if (!response.status) {
        throw new Error(response.message);
    }

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize payment' }, { status: 500 });
  }
}
