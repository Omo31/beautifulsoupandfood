
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Bell, ShoppingCart, FileText, PackageCheck, Truck, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { iconMap } from '@/lib/notifications';

type NotificationBellProps = {
    recipient: 'user' | 'admin';
}

export function NotificationBell({ recipient }: NotificationBellProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(recipient);
    
    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime());
    }, [notifications]);

    const handleItemClick = (id: string) => {
        markAsRead(id);
    }
    
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                {notifications.length > 0 && <Button variant="link" size="sm" className="h-auto p-0" onClick={() => markAllAsRead()}>Mark all as read</Button>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
                 <div className="text-center text-sm text-muted-foreground py-4">
                    You have no new notifications.
                </div>
            ): (
                <>
                    {sortedNotifications.slice(0, 5).map(notification => {
                        const Icon = iconMap[notification.icon as keyof typeof iconMap] || Bell;
                        return (
                            <DropdownMenuItem key={notification.id} asChild className="h-auto" onSelect={() => handleItemClick(notification.id)}>
                                <Link href={notification.href} className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                                    {!notification.read && <span className="mt-1 block h-2 w-2 rounded-full bg-primary" />}
                                    {notification.read && <span className="mt-1 block h-2 w-2" />}
                                    <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div className="flex-1 space-y-1">
                                        <p className="font-semibold text-sm">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}</p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        )
                    })}
                     <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                        <Link href={recipient === 'admin' ? '/admin/notifications' : '/account/notifications'} className="justify-center">View All Notifications</Link>
                    </DropdownMenuItem>
                </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
    )
}
