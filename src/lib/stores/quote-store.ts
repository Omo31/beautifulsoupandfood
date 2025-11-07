
import type { Quote, QuoteStatus } from '@/lib/data';

const initialQuotes: Quote[] = [];


let quotes: Quote[] = initialQuotes;
let listeners: (() => void)[] = [];

const quoteStore = {
  getSnapshot() {
    return quotes;
  },

  getServerSnapshot() {
    return initialQuotes;
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  addQuote(quote: Quote) {
    quotes = [quote, ...quotes];
    listeners.forEach(l => l());
  },

  updateQuote(updatedQuote: Quote) {
    quotes = quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q);
    listeners.forEach(l => l());
  },
};

export default quoteStore;
