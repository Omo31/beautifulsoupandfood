
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, where, documentId } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/utils';
import { useProducts } from './use-products';
import { useToast } from './use-toast';
import type { UserProfile, Product } from '@/lib/data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useWishlist() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

    const wishlistProductIds = useMemo(() => userProfile?.wishlist || [], [userProfile]);

    const wishlistItemsQuery = useMemoFirebase(() => {
        if (!firestore || wishlistProductIds.length === 0) return null;
        // This is a targeted query that fetches ONLY the products in the user's wishlist.
        // It's more efficient than fetching all products and filtering locally.
        return query(collection(firestore, 'products'), where(documentId(), 'in', wishlistProductIds));
    }, [firestore, wishlistProductIds]);

    const { data: wishlistItems, loading: itemsLoading } = useCollection<Product>(wishlistItemsQuery);
    
    // The overall loading state depends on both the user profile and the items being fetched.
    const loading = profileLoading || (wishlistProductIds.length > 0 && itemsLoading);


    const isWishlisted = (productId: string): boolean => {
        return wishlistProductIds.includes(productId);
    };

    const toggleWishlist = async (productId: string) => {
        if (!userDocRef || !userProfile) {
            toast({ variant: 'destructive', title: 'You must be logged in to manage your wishlist.' });
            return;
        }
        
        const isCurrentlyWishlisted = isWishlisted(productId);
        const updateData = {
            wishlist: isCurrentlyWishlisted ? arrayRemove(productId) : arrayUnion(productId)
        };

        // We can't get the product name here easily without another fetch, so we keep the message generic
        updateDoc(userDocRef, updateData)
            .then(() => {
                if (isCurrentlyWishlisted) {
                    toast({ title: 'Removed from Wishlist'});
                } else {
                    toast({ title: 'Added to Wishlist' });
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
        wishlistItems: wishlistItems || [],
        wishlistProductIds,
        isWishlisted,
        toggleWishlist,
        loading,
    };
}
