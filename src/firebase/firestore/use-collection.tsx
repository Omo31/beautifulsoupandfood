'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, Query, DocumentData, CollectionReference } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
        setError(null);
      },
      async (err) => {
        // When a user logs out, q might become stale and cause a permission error.
        // This check prevents a crash by ensuring we have a valid query object `q`
        // before attempting to create and emit a detailed permission error.
        if (q && 'path' in q) {
            const permissionError = new FirestorePermissionError({
                path: q.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setError(permissionError);
        } else {
            // If we get an error but q is invalid (e.g., during logout),
            // set a generic error to avoid crashing the app.
            setError(new Error("Firestore permission error on an invalid query."));
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
}
