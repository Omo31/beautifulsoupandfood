// A simple in-memory store for mock notifications.
// In a real app, this would be backed by Firestore.

import { Bell, FileText, ShoppingBag, MessageSquare } from "lucide-react";

export type Notification = {
    id: string;
    recipient: 'user' | 'admin';
    title: string;
    description: string;
    timestamp: Date;
    read: boolean;
    href: string;
    icon: React.ElementType;
};

let nextId = 5;

const initialNotifications: Notification[] = [
    { id: '1', recipient: 'user', title: 'Quote Ready', description: 'Your quote for QT-001 is ready for review.', timestamp: new Date(Date.now() - 1000 * 60 * 5), read: false, href: '/account/quotes/QT-001', icon: FileText },
    { id: '2', recipient: 'user', title: 'Order Shipped', description: 'Your order ORD-001 has been shipped.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: true, href: '/account/orders/ORD-001', icon: ShoppingBag },
    { id: '3', recipient: 'admin', title: 'New Quote Request', description: 'Chioma Okoro has requested a new quote (QT-002).', timestamp: new Date(Date.now() - 1000 * 60 * 30), read: false, href: '/admin/quotes/QT-002', icon: FileText },
    { id: '4', recipient: 'admin', title: 'New Message', description: 'You have a new message from John Doe.', timestamp: new Date(Date.now() - 1000 * 60 * 60), read: true, href: '/admin/conversations', icon: MessageSquare },
];

let notifications: Notification[] = initialNotifications;

let listeners: (() => void)[] = [];

const notificationStore = {
    addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
        const newNotification: Notification = {
            ...notification,
            id: String(nextId++),
            timestamp: new Date(),
            read: false,
        };
        notifications = [newNotification, ...notifications];
        listeners.forEach(l => l());
    },

    subscribe(listener: () => void) {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    },

    getSnapshot() {
        return notifications;
    },

    markAsRead(id: string) {
        notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        listeners.forEach(l => l());
    },

    markAllAsRead(recipient: 'user' | 'admin') {
        notifications = notifications.map(n => n.recipient === recipient ? { ...n, read: true } : n);
        listeners.forEach(l => l());
    }
};

export default notificationStore;
