
import type { Product } from '@/lib/data';

// This file is no longer the source of truth.
// Products are now fetched directly from Firestore via the useProducts hook.
const initialProducts: Product[] = [];


let products: Product[] = initialProducts;
let listeners: (() => void)[] = [];

const productStore = {
  getSnapshot() {
    return products;
  },

  getServerSnapshot() {
    return initialProducts;
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
};

export default productStore;
