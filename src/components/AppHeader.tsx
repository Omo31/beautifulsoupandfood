'use client';

import Link from 'next/link';
import {
  Bell,
  Search,
  ShoppingCart,
  User,
  ShoppingBag,
  Soup,
  PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';

// Mock authentication state. In a real app, this would come from a context or hook.
const useMockAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // You could expand this to include user info
    // const [user, setUser] = useState(null); 
    return { isAuthenticated, setIsAuthenticated };
}

export default function AppHeader() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar-1');
  const { isAuthenticated } = useMockAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      
      <div className="hidden md:flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/shop"><ShoppingBag className="h-4 w-4 mr-2" />Shop</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/soup"><Soup className="h-4 w-4 mr-2" />Soups</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/custom-order"><PlusCircle className="h-4 w-4 mr-2" />Custom Order</Link>
        </Button>
      </div>

      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      
      <Button variant="ghost" size="icon" className="rounded-full" asChild>
        <Link href="/cart">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Shopping Cart</span>
        </Link>
      </Button>

      {isAuthenticated && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>New order has been placed.</DropdownMenuItem>
            <DropdownMenuItem>Your soup is on the way!</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {isAuthenticated ? (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
                {userAvatar ? (
                <Image
                    src={userAvatar.imageUrl}
                    width={36}
                    height={36}
                    alt="User Avatar"
                    data-ai-hint={userAvatar.imageHint}
                    className="rounded-full"
                />
                ) : (
                    <User className="h-5 w-5" />
                )}
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/account/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/account/orders">Orders</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/account/notifications">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        ) : (
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
        </div>
        )}
    </header>
  );
}
