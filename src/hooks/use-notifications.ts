
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, updateDoc, writeBatch, getDocs, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/utils';
import type { Notification } from '@/lib/notifications';

export function useNotifications(recipient: 'user' | 'admin') {
    const { user } = useUser();
    const firestore = useFirestore();

    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const notificationsRef = collection(firestore, 'notifications');
        if (recipient === 'user') {
            if (!user) return null;
            return query(notificationsRef, where('recipient', '==', 'user'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
        }
        // For admin
        return query(notificationsRef, where('recipient', '==', 'admin'), orderBy('timestamp', 'desc'));
    }, [firestore, user, recipient]);

    const { data: notifications, loading } = useCollection<Notification>(notificationsQuery);

    const markAsRead = async (id: string) => {
        if (!firestore) return;
        const notifRef = doc(firestore, 'notifications', id);
        try {
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!firestore || !notificationsQuery) return;
        try {
            const batch = writeBatch(firestore);
            const unreadSnapshot = await getDocs(query(notificationsQuery, where('read', '==', false)));
            unreadSnapshot.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    return {
        notifications,
        loading,
        unreadCount: notifications.filter(n => !n.read).length,
        markAsRead,
        markAllAsRead,
    };
}
