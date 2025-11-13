'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import type { QuoteRequest } from '@/lib/data';

export function useQuotes() {
  const { user } = useUser();
  const firestore = useFirestore();

  const quotesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const quotesRef = collection(firestore, 'quotes');
    
    // This query requires a composite index in Firestore.
    // The error message in the developer console will provide a link to create it.
    // The required index is on the 'quotes' collection with:
    // 1. `userId` (Ascending)
    // 2. `createdAt` (Descending)
    return query(quotesRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: quotes, loading, error } = useCollection<QuoteRequest>(quotesQuery);

  return {
    quotes,
    loading,
    error,
  };
}
