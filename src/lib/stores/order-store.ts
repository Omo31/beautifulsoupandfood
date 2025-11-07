
import type { Order } from '@/lib/data';

// This store is no longer used for the user-facing app,
// but we'll keep it for the admin section for now.
const initialOrders: Order[] = [
    { id: 'ORD-001', customerName: 'John Doe', date: '2024-05-20', status: 'Delivered', total: 45.99, itemCount: 3, createdAt: new Date() },
    { id: 'ORD-002', customerName: 'Jane Smith', date: '2024-05-19', status: 'Shipped', total: 89.50, itemCount: 5, createdAt: new Date() },
    { id: 'ORD-003', customerName: 'Peter Jones', date: '2024-05-20', status: 'Pending', total: 25.00, itemCount: 2, createdAt: new Date() },
    { id: 'ORD-004', customerName: 'John Doe', date: '2024-05-18', status: 'Delivered', total: 112.75, itemCount: 8, createdAt: new Date() },
    { id: 'ORD-005', customerName: 'Chioma Okoro', date: '2024-05-21', status: 'Awaiting Confirmation', total: 0.00, itemCount: 4, createdAt: new Date() },
];


let orders: Order[] = initialOrders;
let listeners: (() => void)[] = [];

const orderStore = {
  getSnapshot() {
    return orders;
  },

  getServerSnapshot() {
    return initialOrders;
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  addOrder(order: Order) {
    orders = [order, ...orders];
    listeners.forEach(l => l());
  },

  updateOrder(updatedOrder: Order) {
    orders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    listeners.forEach(l => l());
  },

  findById(id: string | undefined): Order | undefined {
    if (!id) return undefined;
    return orders.find(o => o.id === id);
  }
};

export default orderStore;
