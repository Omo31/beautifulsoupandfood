
'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
    const { notifications, markAllAsRead } = useNotifications('user');

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>All Notifications</CardTitle>
                    <CardDescription>A list of all your notifications.</CardDescription>
                </div>
                <Button variant="link" onClick={() => markAllAsRead()}>Mark all as read</Button>
            </CardHeader>
            <CardContent>
                {notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map(notification => (
                            <Link key={notification.id} href={notification.href} className="block">
                                <div className={cn("flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50", !notification.read && "bg-primary/5")}>
                                     {!notification.read && <span className="mt-1.5 block h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
                                     {notification.read && <span className="mt-1.5 block h-2.5 w-2.5 shrink-0" />}
                                     <notification.icon className="h-5 w-5 mt-1 shrink-0 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-4">
                        <Bell className="h-12 w-12" />
                        <h3 className="text-lg font-semibold">No Notifications</h3>
                        <p className="max-w-xs">You don't have any notifications right now. We'll let you know when something new comes up.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
