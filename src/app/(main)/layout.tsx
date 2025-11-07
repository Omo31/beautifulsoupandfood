import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppHeader from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatWidget } from "@/components/ChatWidget";
import { Footer } from "@/components/Footer";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
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
    </FirebaseClientProvider>
  );
}
