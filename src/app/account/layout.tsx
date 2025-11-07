import Link from "next/link";
import { ReactNode } from "react";
import { User, ShoppingCart, Heart, Bell, ArrowLeft, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const accountNavItems = [
    { href: "/account/profile", label: "Profile", icon: User },
    { href: "/account/orders", label: "Order History", icon: ShoppingCart },
    { href: "/account/quotes", label: "My Quotes", icon: FileText },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/notifications", label: "Notifications", icon: Bell },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
