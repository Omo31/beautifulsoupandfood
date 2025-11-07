
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import type { Order } from '@/lib/data';

export function useOrders() {
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const ordersRef = collection(firestore, 'users', user.uid, 'orders');
    return query(ordersRef, orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: orders, loading, error } = useCollection<Order>(ordersQuery);

  const findById = (id: string | undefined): Order | undefined => {
    if (!id) return undefined;
    return orders.find(o => o.id === id);
  };

  return {
    orders,
    loading,
    error,
    findById,
  };
}
