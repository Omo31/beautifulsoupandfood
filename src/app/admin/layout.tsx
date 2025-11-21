
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
  // --- ALL HOOKS ARE NOW CALLED UNCONDITIONALLY AT THE TOP ---
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    // This effect handles redirection for non-admin users.
    // It runs after all hooks have been called.
    const isDevMode = process.env.NODE_ENV === 'development' && searchParams.get('dev_mode') === 'true';
    if (isDevMode) return; // Dev mode grants access, skip checks.

    if (!userLoading && !user) {
      router.replace('/login?redirect=/admin/dashboard');
    }
  }, [user, userLoading, router, searchParams]);

  // --- LOGIC TO DETERMINE WHAT TO RENDER, HAPPENS AFTER HOOKS ---

  const isDevMode = process.env.NODE_ENV === 'development' && searchParams.get('dev_mode') === 'true';
  const loading = userLoading || profileLoading;
  const isOwner = userProfile?.role === 'Owner';
  const hasGranularRoles = userProfile?.roles && userProfile.roles.length > 0;
  const isAdmin = isOwner || hasGranularRoles;

  // Handle temporary admin access for development
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

  // Handle loading state and unauthorized access
  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    );
  }

  // If all checks pass, render the authorized admin layout
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
