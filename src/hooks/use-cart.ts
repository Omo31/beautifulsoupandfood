
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, serverTimestamp, writeBatch, getDocs } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/utils';
import { useProducts } from './use-products';
import { useToast } from './use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type CartItem = {
    id: string;
    quantity: number;
};

export type EnrichedCartItem = {
    id: string;
    quantity: number;
    name: string;
    price: number;
    imageId: string;
    stock: number;
}

export function useCart() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { products, findById } = useProducts();
    const { toast } = useToast();

    const cartCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'cart');
    }, [firestore, user]);

    const { data: cartItems, loading: cartLoading } = useCollection<CartItem>(cartCollectionRef);

    const enrichedCart = useMemo(() => {
        return cartItems
            .map(item => {
                const product = findById(item.id);
                if (!product) return null;
                return {
                    ...item,
                    name: product.name,
                    price: product.price,
                    imageId: product.imageId,
                    stock: product.stock,
                };
            })
            .filter((item): item is EnrichedCartItem => item !== null);
    }, [cartItems, findById]);

    const addToCart = async (productId: string, quantity: number = 1) => {
        if (!firestore || !user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to add items to your cart.' });
            return;
        }

        const product = findById(productId);
        if (!product) {
            toast({ variant: 'destructive', title: 'Product not found' });
            return;
        }
        
        if (product.stock === 0) {
            toast({ variant: 'destructive', title: 'Out of Stock', description: `${product.name} is currently out of stock.`});
            return;
        }
        
        const cartDocRef = doc(firestore, 'users', user.uid, 'cart', productId);
        const cartData = {
            quantity,
            addedAt: serverTimestamp(),
        };

        setDoc(cartDocRef, cartData, { merge: true })
            .then(() => {
                toast({ title: 'Added to Cart', description: `${product.name} has been added to your cart.` });
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

    const updateQuantity = async (productId: string, newQuantity: number) => {
        if (!firestore || !user || newQuantity < 1) return;
        
        const cartDocRef = doc(firestore, 'users', user.uid, 'cart', productId);
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

    const removeFromCart = async (productId: string) => {
        if (!firestore || !user) return;
        
        const cartDocRef = doc(firestore, 'users', user.uid, 'cart', productId);
        
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
            // We don't show a toast here because this is part of a larger flow.
            // The calling function should handle user feedback.
            throw error; // re-throw to be caught by the checkout handler
        }
    };
    
    const subtotal = useMemo(() => {
        return enrichedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    }, [enrichedCart]);


    return {
        cartItems: enrichedCart,
        cartLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
    };
}
