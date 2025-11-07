
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

  addProduct(product: Product) {
    products = [product, ...products];
    listeners.forEach(l => l());
  },

  updateProduct(updatedProduct: Product) {
    products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    listeners.forEach(l => l());
  },

  deleteProduct(productId: string) {
    products = products.filter(p => p.id !== productId);
    listeners.forEach(l => l());
  },
  
  findById(id: string | undefined): Product | undefined {
    if (!id) return undefined;
    return products.find(p => p.id === id);
  }
};

export default productStore;
