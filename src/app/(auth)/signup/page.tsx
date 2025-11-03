'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    return (
        <>
            <CardHeader>
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>Enter your information to create an account.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" placeholder="Max" required className="capitalize" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" placeholder="Robinson" required className="capitalize" />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+234 801 234 5678" required />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="shipping-address">Shipping Address</Label>
                    <Textarea id="shipping-address" placeholder="Enter your full shipping address" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} required />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8" onClick={togglePasswordVisibility}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                        </Button>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm font-normal">
                        I agree to the <Link href="/terms" className="underline">Terms and Conditions</Link>
                    </Label>
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit">
                        Create an account
                    </Button>
                </div>
                <Button variant="outline" className="w-full">
                    Sign up with Google
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center text-sm">
                Already have an account? <Link href="/login" className="underline ml-1">Login</Link>
            </CardFooter>
        </>
    )
}
