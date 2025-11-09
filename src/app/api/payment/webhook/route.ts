
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirestore, doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const app = initializeFirebase();
const firestore = getFirestore(app);

export async function POST(req: Request) {
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    const body = await req.text();
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    if (hash !== req.headers.get('x-paystack-signature')) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
        const { reference, amount, metadata } = event.data;
        const { user_id, order_items, order_type, order_ref } = metadata;

        try {
            const batch = writeBatch(firestore);

            // 1. Create a new order document
            const newOrderRef = doc(collection(firestore, `users/${user_id}/orders`));
            
            const parsedItems = JSON.parse(order_items);
            
            const orderData = {
                createdAt: serverTimestamp(),
                status: 'Awaiting Confirmation',
                itemCount: parsedItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
                total: amount / 100, // Convert from kobo
                paymentReference: reference,
                source: order_type, // 'cart' or 'quote'
                sourceId: order_ref || '', // The quote ID if applicable
            };
            batch.set(newOrderRef, orderData);

            // 2. Create order items in a sub-collection
            const itemsCollectionRef = collection(newOrderRef, 'items');
            for (const item of parsedItems) {
                // The item ID from a cart order payload is the base product ID.
                // We create a new unique ID for the order item document.
                const orderItemRef = doc(itemsCollectionRef); 
                const [productName, variantName] = item.name.split(' (');
                
                const orderItemData = {
                    productId: item.id,
                    name: productName,
                    variantName: variantName ? variantName.slice(0, -1) : 'Standard',
                    quantity: item.quantity,
                    price: item.price,
                    imageId: item.imageId || 'custom-order'
                };
                batch.set(orderItemRef, orderItemData);
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

            // 4. Clear the user's cart IF it was a cart order
            if (order_type === 'cart') {
                const cartCollectionRef = collection(firestore, 'users', user_id, 'cart');
                // Since we don't have the composite cart item IDs here, we have to fetch them.
                // This is a tradeoff for simplicity in the webhook.
                const cartSnapshot = await getDocs(cartCollectionRef);
                cartSnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
            } else if (order_type === 'quote' && order_ref) {
                 // 5. Update the quote status to 'Paid' if it was a quote order
                const quoteRef = doc(firestore, 'quotes', order_ref);
                batch.update(quoteRef, { status: 'Paid' });
            }
            
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

    
