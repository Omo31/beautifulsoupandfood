'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { NotificationBell } from './NotificationBell';
import { SearchInput } from './SearchInput';

export default function AdminHeader() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar-1');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      
      <div className="relative ml-auto flex-1 md:grow-0">
        <SearchInput placeholder="Search..." />
      </div>

      <NotificationBell recipient="admin" />

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
          <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/admin/settings">Settings</Link></DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/">Logout</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
