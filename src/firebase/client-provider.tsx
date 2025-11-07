'use client';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { ReactNode, useMemo } from 'react';
import {
  FirebaseProvider,
  initializeFirebase,
} from '@/firebase';
import type { FirebaseApp } from 'firebase/app';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, auth, firestore } = useMemo(() => {
    const app = initializeFirebase();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  }, []);

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
