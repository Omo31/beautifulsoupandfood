
'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { iconMap } from '@/lib/notifications';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminNotificationsPage() {
    const { notifications, markAllAsRead, loading } = useNotifications('admin');

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                            <Skeleton className="h-5 w-5 mt-1" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ))}
                </div>
            );
        }

        if (notifications.length > 0) {
            return (
                <div className="space-y-4">
                    {notifications.map(notification => {
                        const Icon = iconMap[notification.icon] || Bell;
                        return (
                            <Link key={notification.id} href={notification.href} className="block">
                                <div className={cn("flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50", !notification.read && "bg-primary/5")}>
                                     {!notification.read && <span className="mt-1.5 block h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
                                     {notification.read && <span className="mt-1.5 block h-2.5 w-2.5 shrink-0" />}
                                     <Icon className="h-5 w-5 mt-1 shrink-0 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-4">
                <Bell className="h-12 w-12" />
                <h3 className="text-lg font-semibold">All Caught Up!</h3>
                <p className="max-w-xs">You don't have any notifications right now.</p>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>All Admin Notifications</CardTitle>
                    <CardDescription>A list of all notifications requiring your attention.</CardDescription>
                </div>
                <Button variant="link" onClick={() => markAllAsRead()}>Mark all as read</Button>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
