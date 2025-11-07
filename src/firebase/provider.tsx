'use client';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const FirebaseContext = createContext<
  | {
      app: FirebaseApp;
      auth: Auth;
      firestore: Firestore;
    }
  | undefined
>(undefined);

export function FirebaseProvider({
  children,
  app,
  auth,
  firestore,
}: {
  children: ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

function useFirebase<T>(
  contextKey: 'app' | 'auth' | 'firestore'
): T | undefined {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    return undefined;
  }
  return context[contextKey] as T;
}

export function useFirebaseApp(): FirebaseApp | undefined {
  return useFirebase<FirebaseApp>('app');
}

export function useAuth(): Auth | undefined {
  return useFirebase<Auth>('auth');
}

export function useFirestore(): Firestore | undefined {
  return useFirebase<Firestore>('firestore');
}
