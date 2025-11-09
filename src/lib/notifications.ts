
import { addDoc, collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { Bell, FileText, ShoppingBag, MessageSquare, Truck, PackageCheck, Icon } from "lucide-react";

export type Notification = {
    id: string;
    recipient: 'user' | 'admin';
    userId?: string; // Only for user notifications
    title: string;
    description: string;
    timestamp: any; // Firestore Timestamp
    read: boolean;
    href: string;
    icon: string; // Store icon name as string
};

type CreateNotificationPayload = Omit<Notification, 'id' | 'timestamp' | 'read'>

export const iconMap: { [key: string]: Icon } = {
    Bell,
    FileText,
    ShoppingBag,
    MessageSquare,
    Truck,
    PackageCheck,
};


export const createNotification = async (firestore: Firestore, payload: CreateNotificationPayload) => {
    try {
        const notificationsRef = collection(firestore, 'notifications');
        await addDoc(notificationsRef, {
            ...payload,
            timestamp: serverTimestamp(),
            read: false,
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        // In a real app, you might want to handle this error more gracefully
    }
};
