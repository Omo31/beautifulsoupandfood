
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirestore, doc, collection, writeBatch, serverTimestamp, getDocs, runTransaction, DocumentReference } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { createNotification } from '@/lib/notifications';
import type { Product, ProductVariant } from '@/lib/data';

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
            const parsedItems = JSON.parse(order_items);

            // Use a transaction to ensure atomicity
            await runTransaction(firestore, async (transaction) => {

                // 1. Decrement stock for each item IF it's a cart order
                if (order_type === 'cart') {
                    for (const item of parsedItems) {
                        const productRef = doc(firestore, 'products', item.id) as DocumentReference<Product>;
                        const productDoc = await transaction.get(productRef);

                        if (!productDoc.exists()) {
                            throw new Error(`Product with ID ${item.id} not found.`);
                        }

                        const productData = productDoc.data();
                        const variantName = item.name.split(' (')[1]?.slice(0, -1) || 'Standard';
                        const variantIndex = productData.variants.findIndex((v: ProductVariant) => v.name === variantName);
                        
                        if (variantIndex === -1) {
                            throw new Error(`Variant "${variantName}" for product "${productData.name}" not found.`);
                        }

                        const variant = productData.variants[variantIndex];
                        if (variant.stock < item.quantity) {
                            throw new Error(`Not enough stock for ${productData.name} (${variant.name}). Available: ${variant.stock}, Requested: ${item.quantity}.`);
                        }

                        const newVariants = [...productData.variants];
                        newVariants[variantIndex] = { ...variant, stock: variant.stock - item.quantity };
                        transaction.update(productRef, { variants: newVariants });
                    }
                }

                // --- The following operations are safe to perform after stock has been validated and updated ---
                const batch = writeBatch(firestore);

                // 2. Create a new order document
                const newOrderRef = doc(collection(firestore, `users/${user_id}/orders`));
                
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

                // 3. Create order items in a sub-collection
                const itemsCollectionRef = collection(newOrderRef, 'items');
                for (const item of parsedItems) {
                    const orderItemRef = doc(itemsCollectionRef);
                    // For cart items, the name is composite. For quote items, it's simple.
                    const [productName, variantNamePart] = item.name.split(' (');
                    const variantName = variantNamePart ? variantNamePart.slice(0, -1) : (item.measure || 'Standard');

                    const orderItemData = {
                        // For quotes, the ID is not a real product ID, so we use a placeholder
                        productId: order_type === 'quote' ? `custom-order-${order_ref}` : item.id,
                        name: productName,
                        variantName: variantName,
                        quantity: item.quantity,
                        price: item.price,
                        imageId: item.imageId || 'custom-order'
                    };
                    batch.set(orderItemRef, orderItemData);
                }
                
                // 4. Create a transaction record
                const transactionRef = doc(collection(firestore, 'transactions'));
                const transactionData = {
                    date: serverTimestamp(),
                    description: `Sale - Order #${newOrderRef.id.substring(0, 6)}`,
                    category: 'Sale',
                    type: 'Sale',
                    amount: amount / 100,
                };
                batch.set(transactionRef, transactionData);

                // 5. Clear the user's cart IF it was a cart order
                if (order_type === 'cart') {
                    const cartCollectionRef = collection(firestore, 'users', user_id, 'cart');
                    const cartSnapshot = await getDocs(cartCollectionRef); // Must be getDocs, not transaction.get
                    cartSnapshot.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                } else if (order_type === 'quote' && order_ref) {
                    // 6. Update the quote status to 'Paid' if it was a quote order
                    const quoteRef = doc(firestore, 'quotes', order_ref);
                    batch.update(quoteRef, { status: 'Paid' });
                }

                // Commit the batch operations within the transaction scope
                await batch.commit();
            }); // End of Firestore Transaction

            // Create admin notification outside of the transaction
            const orderId = (await getDocs(collection(firestore, `users/${user_id}/orders`))).docs.sort((a,b) => b.data().createdAt.toMillis() - a.data().createdAt.toMillis())[0].id;
            createNotification(firestore, {
              recipient: 'admin',
              title: 'New Order Received!',
              description: `A new order #${orderId.substring(0, 6)} for ₦${(amount / 100).toFixed(2)} was placed.`,
              href: `/admin/orders/${orderId}`,
              icon: 'ShoppingBag',
            });

        } catch (error) {
            console.error("Webhook processing error:", error);
            // If this fails, we need to handle it, maybe with retries or logging for manual intervention.
            // Returning 500 so Paystack might retry.
            return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
}
