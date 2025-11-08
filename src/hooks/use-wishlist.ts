
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/utils';
import { useProducts } from './use-products';
import { useToast } from './use-toast';
import type { UserProfile, Product } from '@/lib/data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useWishlist() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { products } = useProducts();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, loading } = useDoc<UserProfile>(userDocRef);

    const wishlistProductIds = userProfile?.wishlist || [];

    const wishlistItems = useMemo(() => {
        return wishlistProductIds
            .map(productId => products.find(p => p.id === productId))
            .filter((p): p is Product => p !== undefined);
    }, [wishlistProductIds, products]);

    const isWishlisted = (productId: string): boolean => {
        return wishlistProductIds.includes(productId);
    };

    const toggleWishlist = async (productId: string) => {
        if (!userDocRef) {
            toast({ variant: 'destructive', title: 'You must be logged in to manage your wishlist.' });
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const isCurrentlyWishlisted = isWishlisted(productId);
        const updateData = {
            wishlist: isCurrentlyWishlisted ? arrayRemove(productId) : arrayUnion(productId)
        };

        updateDoc(userDocRef, updateData)
            .then(() => {
                if (isCurrentlyWishlisted) {
                    toast({ title: 'Removed from Wishlist', description: `${product.name} has been removed from your wishlist.` });
                } else {
                    toast({ title: 'Added to Wishlist', description: `${product.name} has been added to your wishlist.` });
                }
            })
            .catch(async (serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: { wishlist: `[... current, ${isCurrentlyWishlisted ? 'removed' : 'added'}: ${productId}]` }
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    return {
        wishlistItems,
        wishlistProductIds,
        isWishlisted,
        toggleWishlist,
        loading,
    };
}
