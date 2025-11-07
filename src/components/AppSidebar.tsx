'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Soup,
  PlusCircle,
  LayoutGrid,
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
import { useUser } from '@/firebase';

const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shop', label: 'Shop', icon: ShoppingBag, className: "md:hidden" },
  { href: '/soup', label: 'Soups', icon: Soup, className: "md:hidden" },
  { href: '/custom-order', label: 'Custom Order', icon: PlusCircle, className: "md:hidden" },
  { href: '/admin/dashboard', label: 'Admin', icon: LayoutGrid, admin: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user } = useUser();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  const visibleMenuItems = menuItems.filter(item => {
    // The admin link should only be shown if the user is authenticated.
    // In a real app, you'd also check if user.role === 'Owner'
    if (item.admin) {
        return !!user;
    }
    return true;
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {visibleMenuItems.map((item) => (
            <SidebarMenuItem key={item.label} className={item.className}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={item.admin ? 'mt-auto' : ''}
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
