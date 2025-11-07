
'use client';

import { useSyncExternalStore } from 'react';
import orderStore from '@/lib/stores/order-store';

export function useOrders() {
  const orders = useSyncExternalStore(orderStore.subscribe, orderStore.getSnapshot, orderStore.getServerSnapshot);
  return {
    orders,
    addOrder: orderStore.addOrder,
    updateOrder: orderStore.updateOrder,
    findById: orderStore.findById,
  };
}
