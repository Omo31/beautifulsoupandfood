

'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Product } from '@/lib/data';
import { useMemoFirebase } from '@/firebase/utils';


export function useProducts() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Sort by name by default to ensure a consistent order
    return query(collection(firestore, 'products'), orderBy('name'));
  }, [firestore]);

  const { data: products, loading, error } = useCollection<Product>(productsQuery);

  const findById = (id: string | undefined): Product | undefined => {
    if (!id) return undefined;
    return products.find(p => p.id === id);
  };

  return {
    products,
    loading,
    error,
    findById,
  };
}
