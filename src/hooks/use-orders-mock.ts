
'use client';

import { useSyncExternalStore } from 'react';
import orderStore from '@/lib/stores/order-store';

// This is a temporary hook to use the mock store for the admin panel
export function useOrders() {
  const orders = useSyncExternalStore(orderStore.subscribe, orderStore.getSnapshot, orderStore.getServerSnapshot);
  return {
    orders,
    addOrder: orderStore.addOrder,
    updateOrder: orderStore.updateOrder,
    findById: orderStore.findById,
  };
}
