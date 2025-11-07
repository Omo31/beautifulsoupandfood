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
    return query(quotesRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: quotes, loading, error } = useCollection<QuoteRequest>(quotesQuery);

  return {
    quotes,
    loading,
    error,
  };
}
