
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
import { useUser, useFirestore, useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/data';
import { useMemoFirebase } from '@/firebase/utils';
import { doc } from 'firebase/firestore';

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
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  const isAdmin = userProfile?.role === 'Owner' || userProfile?.role === 'Content Manager';

  const visibleMenuItems = menuItems.filter(item => {
    if (item.admin) {
        return isAdmin;
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
