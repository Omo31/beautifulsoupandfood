
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Users,
  BarChart,
  Settings,
  Package,
  FileText,
  DollarSign,
  MessageSquare,
  ClipboardList,
  Bell,
  ArrowLeft,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/Logo';
import { Separator } from './ui/separator';
import { useUser, useFirestore, useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/data';
import { useMemoFirebase } from '@/firebase/utils';
import { doc } from 'firebase/firestore';

const adminMenuItems = [
  { id: 'dashboard', href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { id: 'orders', href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { id: 'quotes', href: '/admin/quotes', label: 'Quotes', icon: ClipboardList },
  { id: 'users', href: '/admin/users', label: 'Users', icon: Users, ownerOnly: true },
  { id: 'inventory', href: '/admin/inventory', label: 'Inventory', icon: Package },
  { id: 'conversations', href: '/admin/conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'purchase-orders', href: '/admin/purchase-orders', label: 'Purchase Orders', icon: FileText },
  { id: 'accounting', href: '/admin/accounting', label: 'Accounting', icon: DollarSign },
  { id: 'analytics', href: '/admin/analytics', label: 'Analytics', icon: BarChart },
  { id: 'notifications', href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', href: '/admin/settings', label: 'Settings', icon: Settings, ownerOnly: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  const isOwner = userProfile?.role === 'Owner';
  const userRoles = userProfile?.roles || [];

  const visibleMenuItems = adminMenuItems.filter(item => {
    if (isOwner) return true; // Owner sees everything
    if (item.ownerOnly) return false; // Non-owners never see owner-only items
    return userRoles.includes(item.id);
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin/dashboard" onClick={handleLinkClick}>
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
            <p className="text-xs text-sidebar-foreground/70 px-4 pt-2 pb-1 font-semibold">Admin</p>
          {visibleMenuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
              >
                <Link href={item.href} onClick={handleLinkClick}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/" onClick={handleLinkClick}>
                        <ArrowLeft />
                        <span>Back to Home</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
