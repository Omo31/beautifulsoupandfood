
'use client';

import { useSyncExternalStore } from 'react';
import productStore from '@/lib/stores/product-store';

export function useProducts() {
  const products = useSyncExternalStore(productStore.subscribe, productStore.getSnapshot, productStore.getServerSnapshot);
  return {
    products,
    addProduct: productStore.addProduct,
    updateProduct: productStore.updateProduct,
    deleteProduct: productStore.deleteProduct,
    findById: productStore.findById,
  };
}
