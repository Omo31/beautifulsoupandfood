'use client';

import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppHeader from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatWidget } from "@/components/ChatWidget";
import { Footer } from "@/components/Footer";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ProtectedMainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's a user...
    if (!loading && user) {
      // ...but their email is not verified...
      if (!user.emailVerified) {
        // ...redirect them to the verify-email page.
        router.replace('/verify-email');
      }
    }
  }, [user, loading, router]);
  
  // While loading, or if the user is unverified and waiting for redirect, show a loading state.
  if (loading || (user && !user.emailVerified)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    );
  }

  // If user is verified or not logged in (public pages), show the content.
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Footer />
      </SidebarInset>
      <ChatWidget />
    </SidebarProvider>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
      <ProtectedMainLayout>{children}</ProtectedMainLayout>
  );
}
