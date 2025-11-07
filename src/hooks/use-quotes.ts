
'use client';

import { useSyncExternalStore } from 'react';
import quoteStore from '@/lib/stores/quote-store';

export function useQuotes() {
  const quotes = useSyncExternalStore(quoteStore.subscribe, quoteStore.getSnapshot, quoteStore.getServerSnapshot);
  return {
    quotes,
    addQuote: quoteStore.addQuote,
    updateQuote: quoteStore.updateQuote,
  };
}
