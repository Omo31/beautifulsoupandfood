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
  ArrowLeft,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/Logo';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/admin/purchase-orders', label: 'Purchase Orders', icon: FileText },
  { href: '/admin/accounting', label: 'Accounting', icon: DollarSign },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
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
          {menuItems.map((item) => (
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
      <SidebarSeparator />
      <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/" onClick={handleLinkClick}>
                        <ArrowLeft />
                        <span>Back to Shop</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
