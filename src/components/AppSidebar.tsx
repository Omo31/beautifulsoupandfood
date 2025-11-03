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
import { useState } from 'react';

const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shop', label: 'Shop', icon: ShoppingBag, className: "md:hidden" },
  { href: '/soup', label: 'Soups', icon: Soup, className: "md:hidden" },
  { href: '/custom-order', label: 'Custom Order', icon: PlusCircle, className: "md:hidden" },
  { href: '/admin/dashboard', label: 'Admin', icon: LayoutGrid, admin: true },
];

// Mock authentication state. In a real app, this would come from a context or hook.
const useMockAuth = () => {
    // For now, we will simulate a logged-in state.
    const [isAuthenticated, setIsAuthenticated] = useState(true); 
    // In a real app, you would also have user role information here.
    // const [user, setUser] = useState({ role: 'Owner' }); 
    return { isAuthenticated };
}

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { isAuthenticated } = useMockAuth(); // Using the mock auth state

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  const visibleMenuItems = menuItems.filter(item => {
    // The admin link should only be shown if the user is authenticated.
    // In a real app, you'd also check if user.role === 'Owner'
    if (item.admin) {
        return isAuthenticated;
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
