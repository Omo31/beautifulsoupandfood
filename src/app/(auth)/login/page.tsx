'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Enter your email below to login to your account.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                            Forgot your password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} required />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit">
                        Login
                    </Button>
                </div>
                <Button variant="outline" className="w-full">
                    Login with Google
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center text-sm">
                Don&apos;t have an account? <Link href="/signup" className="underline ml-1">Sign up</Link>
            </CardFooter>
        </>
    )
}
