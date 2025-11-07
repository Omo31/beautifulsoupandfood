'use client';

import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { FirebaseClientProvider } from "@/firebase";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="mb-6">
              <Link href="/">
                  <Logo />
              </Link>
          </div>
          <Card className="w-full max-w-sm">
              {children}
          </Card>
      </div>
    </FirebaseClientProvider>
  );
}
