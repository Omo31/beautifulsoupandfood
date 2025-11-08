
'use client';

import { Logo } from "./Logo";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

export function Footer() {
    const { settings } = useSettings();

    const socialLinks = settings?.footer?.socialLinks || { facebook: '#', instagram: '#', twitter: '#' };
    const legalLinks = settings?.footer?.legalLinks || { terms: '#', privacy: '#' };

    return (
        <footer className="bg-muted text-muted-foreground">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Logo />
                        <p className="text-sm">Authentic Nigerian Flavors, Delivered.</p>
                        <div className="flex space-x-4">
                            <Link href={socialLinks.facebook} className="hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                            <Link href={socialLinks.twitter} className="hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                            <Link href={socialLinks.instagram} className="hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Quick Links</h3>
                        <ul className="space-y-2 mt-4 text-sm">
                            <li><Link href="/" className="hover:text-primary">Home</Link></li>
                            <li><Link href="/shop" className="hover:text-primary">Shop</Link></li>
                            <li><Link href="/soup" className="hover:text-primary">Soups</Link></li>
                            <li><Link href="/custom-order" className="hover:text-primary">Custom Order</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">My Account</h3>
                        <ul className="space-y-2 mt-4 text-sm">
                            <li><Link href="/account/profile" className="hover:text-primary">Profile</Link></li>
                            <li><Link href="/account/orders" className="hover:text-primary">Orders</Link></li>
                            <li><Link href="/auth/login" className="hover:text-primary">Login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Legal</h3>
                        <ul className="space-y-2 mt-4 text-sm">
                            <li><Link href={legalLinks.privacy} className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href={legalLinks.terms} className="hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t mt-8 pt-6 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} BeautifulSoup&Food. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
