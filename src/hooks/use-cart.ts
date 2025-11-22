
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, serverTimestamp, writeBatch, getDocs, query, where, documentId } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/utils';
import { useToast } from './use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Product } from '@/lib/data';

export type CartItem = {
    id: string; // This is now a composite key: `${productId}-${variantName}`
    productId: string;
    variantName: string;
    quantity: number;
};

export type EnrichedCartItem = {
    id: string; // Composite key
    productId: string;
    variantName: string;
    quantity: number;
    name: string;
    price: number;
    imageId: string;
    stock: number;
}

export function useCart() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [enriching, setEnriching] = useState(false);

    const cartCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'cart');
    }, [firestore, user]);

    const { data: cartItems, loading: cartLoading } = useCollection<CartItem>(cartCollectionRef);
    
    // This effect fetches the full product details ONLY for items in the cart
    useEffect(() => {
        if (!firestore || cartItems.length === 0) {
            setProducts([]);
            return;
        }

        const productIds = [...new Set(cartItems.map(item => item.productId))];
        
        // This check prevents a Firestore error if the cart is cleared
        if (productIds.length === 0) {
            setProducts([]);
            return;
        }
        
        setEnriching(true);
        const productsQuery = query(collection(firestore, 'products'), where(documentId(), 'in', productIds));

        getDocs(productsQuery).then(snapshot => {
            const fetchedProducts: Product[] = [];
            snapshot.forEach(doc => {
                fetchedProducts.push({ ...doc.data(), id: doc.id } as Product);
            });
            setProducts(fetchedProducts);
        }).catch(error => {
            console.error("Error fetching product details for cart:", error);
            setProducts([]);
        }).finally(() => {
            setEnriching(false);
        });
    }, [cartItems, firestore]);
    
    const findById = (id: string | undefined): Product | undefined => {
        if (!id) return undefined;
        return products.find(p => p.id === id);
    };

    const enrichedCart = useMemo(() => {
        if (products.length === 0 && cartItems.length > 0 && !enriching) return [];
        return cartItems
            .map(item => {
                const product = findById(item.productId);
                if (!product) return null;

                const variant = product.variants.find(v => v.name === item.variantName);
                if (!variant) return null;

                return {
                    ...item,
                    id: `${item.productId}-${item.variantName}`, // Ensure composite ID is correctly used
                    name: product.name,
                    price: variant.price,
                    imageId: product.imageUrl,
                    stock: variant.stock,
                };
            })
            .filter((item): item is EnrichedCartItem => item !== null);
    }, [cartItems, products, enriching]);

    const addToCart = async (productId: string, quantity: number = 1, variantName: string) => {
        if (!firestore || !user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to add items to your cart.' });
            return;
        }

        // We can't check stock on add anymore without fetching the product first.
        // The check on the detail page is now the primary gatekeeper.
        // A server-side check (e.g. Firebase Function) would be the most robust solution.

        const cartItemId = `${productId}-${variantName}`;
        const cartDocRef = doc(firestore, 'users', user.uid, 'cart', cartItemId);
        
        const cartData = {
            productId: productId,
            variantName: variantName,
            quantity: quantity,
            addedAt: serverTimestamp(),
        };

        setDoc(cartDocRef, cartData, { merge: true })
            .then(() => {
                toast({ title: 'Added to Cart', description: `Item has been added to your cart.` });
            })
            .catch(async (serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: cartDocRef.path,
                    operation: 'create',
                    requestResourceData: cartData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    const updateQuantity = async (cartItemId: string, newQuantity: number) => {
        if (!firestore || !user || newQuantity < 1) return;
        
        const cartDocRef = doc(firestore, 'users', user.uid, 'cart', cartItemId);
        const updateData = { quantity: newQuantity };

        setDoc(cartDocRef, updateData, { merge: true })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: cartDocRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    const removeFromCart = async (cartItemId: string) => {
        if (!firestore || !user) return;
        
        const cartDocRef = doc(firestore, 'users', user.uid, 'cart', cartItemId);
        
        deleteDoc(cartDocRef)
            .then(() => {
                toast({ title: 'Item Removed', description: 'The item has been removed from your cart.' });
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: cartDocRef.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    const clearCart = async () => {
        if (!firestore || !user || !cartCollectionRef) return;
        try {
            const batch = writeBatch(firestore);
            const querySnapshot = await getDocs(cartCollectionRef);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error clearing cart: ", error);
            throw error; 
        }
    };
    
    const subtotal = useMemo(() => {
        return enrichedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    }, [enrichedCart]);


    return {
        cartItems: enrichedCart,
        cartLoading: cartLoading || enriching,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
    };
}
