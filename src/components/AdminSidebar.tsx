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
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/Logo';

const adminMenuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/quotes', label: 'Quotes', icon: ClipboardList },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/admin/purchase-orders', label: 'Purchase Orders', icon: FileText },
  { href: '/admin/accounting', label: 'Accounting', icon: DollarSign },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

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
          {adminMenuItems.map((item) => (
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
    </Sidebar>
  );
}
