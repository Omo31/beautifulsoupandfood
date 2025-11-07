'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, Query, DocumentData, CollectionReference } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useCollection<T>(q: Query | CollectionReference | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docs: T[] = [];
        querySnapshot.forEach((doc) => {
          docs.push({ ...doc.data(), id: doc.id } as T);
        });
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
        console.error("Error fetching collection:", err);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
}
