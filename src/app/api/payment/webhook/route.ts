
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirestore, doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const app = initializeFirebase();
const firestore = getFirestore(app);

export async function POST(req: Request) {
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    const hash = crypto.createHmac('sha512', secret).update(await req.text()).digest('hex');
    if (hash !== req.headers.get('x-paystack-signature')) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = await req.json();

    if (event.event === 'charge.success') {
        const { reference, amount, metadata } = event.data;
        const { user_id, cart_items } = metadata;

        try {
            const batch = writeBatch(firestore);

            // 1. Create a new order document
            const newOrderRef = doc(collection(firestore, `users/${user_id}/orders`));
            
            const parsedCartItems = JSON.parse(cart_items);
            
            const orderData = {
                createdAt: serverTimestamp(),
                status: 'Awaiting Confirmation',
                itemCount: parsedCartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
                total: amount / 100, // Convert from kobo
                paymentReference: reference,
            };
            batch.set(newOrderRef, orderData);

            // 2. Create order items in a sub-collection
            const itemsCollectionRef = collection(newOrderRef, 'items');
            for (const item of parsedCartItems) {
                const itemRef = doc(itemsCollectionRef, item.id);
                const orderItemData = {
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    imageId: item.imageId
                };
                batch.set(itemRef, orderItemData);
            }
            
            // 3. Create a transaction record
            const transactionRef = doc(collection(firestore, 'transactions'));
            const transactionData = {
                date: serverTimestamp(),
                description: `Sale - Order #${newOrderRef.id.substring(0, 6)}`,
                category: 'Sale',
                type: 'Sale',
                amount: amount / 100,
            };
            batch.set(transactionRef, transactionData);

            // 4. Clear the user's cart
            const cartCollectionRef = collection(firestore, 'users', user_id, 'cart');
            for (const item of parsedCartItems) {
                const cartItemRef = doc(cartCollectionRef, item.id);
                batch.delete(cartItemRef);
            }
            
            // 5. Commit the batch
            await batch.commit();

        } catch (error) {
            console.error("Webhook processing error:", error);
            // If this fails, we need to handle it, maybe with retries or logging for manual intervention.
            // Returning 500 so Paystack might retry.
            return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
}
