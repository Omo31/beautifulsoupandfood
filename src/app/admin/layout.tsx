
'use client';

import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminHeader from "@/components/AdminHeader";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/utils";
import { doc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/lib/data";


function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  // --- Development-only temporary admin access ---
  const isDevMode = process.env.NODE_ENV === 'development' && searchParams.get('dev_mode') === 'true';

  useEffect(() => {
    // Skip auth checks in dev mode
    if (isDevMode) return;

    if (!userLoading && !user) {
      router.replace('/login?redirect=/admin/dashboard');
    }
  }, [user, userLoading, router, isDevMode]);

  // Determine loading state and admin status *after* all hooks are called
  const loading = userLoading || profileLoading;
  const isOwner = userProfile?.role === 'Owner';
  const hasGranularRoles = userProfile?.roles && userProfile.roles.length > 0;
  const isAdmin = isOwner || hasGranularRoles;

  // --- RENDER LOGIC BASED ON STATE ---

  // Handle the temporary admin dev mode case
  if (isDevMode) {
    return (
      <SidebarProvider defaultOpen>
        <AdminSidebar isTemporaryAdmin={true} />
        <SidebarInset>
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Handle loading and authorization for regular users
  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    );
  }
  
  // If authorized, show the admin layout
  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function AdminLayout({ children }: { children: ReactNode }) {
  // The FirebaseClientProvider is already in the root layout for the main app,
  // but we need it here as well because the admin section is a separate route group.
  // This ensures Firebase is available to our ProtectedAdminLayout.
  return (
      <ProtectedAdminLayout>{children}</ProtectedAdminLayout>
  );
}
