
import type { Quote, QuoteStatus } from '@/lib/data';

const initialQuotes: Quote[] = [
    { id: 'QT-001', date: '2024-05-22', status: 'Quote Ready', total: 28500.00, customerName: 'John Doe', itemCount: 2 },
    { id: 'QT-002', date: '2024-05-21', status: 'Pending Review', total: null, customerName: 'Chioma Okoro', itemCount: 1 },
    { id: 'QT-003', date: '2024-05-18', status: 'Accepted', total: 15750.00, customerName: 'Bayo Ojo', itemCount: 3 },
    { id: 'QT-004', date: '2024-05-17', status: 'Expired', total: 5500.00, customerName: 'Jane Smith', itemCount: 1 },
    { id: 'QT-005', date: '2024-05-23', status: 'Awaiting Revision', total: null, customerName: 'Peter Jones', itemCount: 2 },
];

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
