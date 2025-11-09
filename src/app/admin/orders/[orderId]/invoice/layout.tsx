'use client';

import { FirebaseClientProvider } from "@/firebase";
import { ReactNode } from "react";

// This layout provides a clean slate for the printable invoice,
// without the regular admin sidebar and header.
export default function InvoiceLayout({ children }: { children: ReactNode }) {
    return (
        <FirebaseClientProvider>
            <div className="bg-background min-h-screen">
                {children}
            </div>
        </FirebaseClientProvider>
    );
}
