
'use client';

import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { User, ShoppingCart, Heart, Bell, ArrowLeft, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FirebaseClientProvider, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/Footer";

const accountNavItems = [
    { href: "/account/profile", label: "Profile", icon: User },
    { href: "/account/orders", label: "Order History", icon: ShoppingCart },
    { href: "/account/quotes", label: "My Quotes", icon: FileText },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/notifications", label: "Notifications", icon: Bell },
];

function ProtectedAccountLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login?redirect=/account/profile');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
            </div>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-[240px_1fr] gap-8">
                            <aside className="hidden md:block">
                                <div className="flex flex-col h-full">
                                    <div>
                                        <h2 className="text-xl font-bold font-headline mb-4">My Account</h2>
                                        <nav className="flex flex-col gap-2">
                                            {accountNavItems.map(item => (
                                                <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                                                    <item.icon className="h-4 w-4" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </nav>
                                    </div>
                                    <div className="mt-auto">
                                        <Separator className="my-4" />
                                        <Link href="/shop" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to Shop
                                        </Link>
                                    </div>
                                </div>
                            </aside>
                            <main>
                                {children}
                            </main>
                        </div>
                    </div>
                </main>
                <Footer />
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function AccountLayout({ children }: { children: ReactNode }) {
    return (
        <FirebaseClientProvider>
            <ProtectedAccountLayout>{children}</ProtectedAccountLayout>
        </FirebaseClientProvider>
    )
}
