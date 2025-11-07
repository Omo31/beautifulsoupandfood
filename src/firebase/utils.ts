
'use client';
import { useMemo } from 'react';

// A utility function to memoize Firebase queries and document references.
// This is crucial to prevent infinite loops in `useEffect` hooks within `useCollection` and `useDoc`.
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

