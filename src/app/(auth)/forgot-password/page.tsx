'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email address and we will send you a link to reset your password.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
                <Button type="submit" className="w-full">
                    Send Reset Link
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center text-sm">
                Remember your password? <Link href="/auth/login" className="underline ml-1">Login</Link>
            </CardFooter>
        </>
    )
}
