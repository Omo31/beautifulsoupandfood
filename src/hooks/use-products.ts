
'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Product } from '@/lib/data';

export function useProducts() {
  const firestore = useFirestore();

  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
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
