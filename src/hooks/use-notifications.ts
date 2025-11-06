'use client';

import { useState, useEffect } from 'react';
import notificationStore from '@/lib/notifications';
import type { Notification } from '@/lib/notifications';

export function useNotifications(recipient: 'user' | 'admin') {
    const [notifications, setNotifications] = useState(notificationStore.getSnapshot());

    useEffect(() => {
        const unsubscribe = notificationStore.subscribe(() => {
            setNotifications(notificationStore.getSnapshot());
        });
        return () => unsubscribe();
    }, []);

    const recipientNotifications = notifications.filter(n => n.recipient === recipient);

    return {
        notifications: recipientNotifications,
        unreadCount: recipientNotifications.filter(n => !n.read).length,
        markAsRead: notificationStore.markAsRead,
        markAllAsRead: () => notificationStore.markAllAsRead(recipient),
    };
}
