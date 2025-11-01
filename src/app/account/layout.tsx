import Link from "next/link";
import { ReactNode } from "react";
import { User, ShoppingCart, Heart, Bell } from "lucide-react";

const accountNavItems = [
    { href: "/account/profile", label: "Profile", icon: User },
    { href: "/account/orders", label: "Order History", icon: ShoppingCart },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/notifications", label: "Notifications", icon: Bell },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
    return (
        <div className="grid md:grid-cols-[240px_1fr] gap-8">
            <aside>
                <h2 className="text-xl font-bold font-headline mb-4">My Account</h2>
                <nav className="flex flex-col gap-2">
                    {accountNavItems.map(item => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main>
                {children}
            </main>
        </div>
    );
}
