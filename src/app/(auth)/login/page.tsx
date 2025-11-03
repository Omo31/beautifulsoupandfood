'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

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
                    <Input id="password" type="password" required />
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
                Don't have an account? <Link href="/signup" className="underline ml-1">Sign up</Link>
            </CardFooter>
        </>
    )
}
