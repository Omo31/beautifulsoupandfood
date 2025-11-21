
'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { initializeFirebase } from "@/firebase";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    
    const { auth } = useMemo(() => {
        const app = initializeFirebase();
        return {
            auth: getAuth(app),
        };
    }, []);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const handleAuthError = (errorCode: string) => {
        let description = "An unexpected error occurred. Please try again.";
        switch (errorCode) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                description = "Invalid email or password. Please try again.";
                break;
            case 'auth/too-many-requests':
                description = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
                break;
             case 'auth/popup-closed-by-user':
                description = "The sign-in popup was closed before completing. Please try again.";
                break;
            case 'auth/internal-error':
                 description = "An internal error occurred. This might be due to a configuration issue. Please try again later.";
                 break;
        }
        toast({
            variant: "destructive",
            title: "Login Failed",
            description,
        });
    }

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast({
                title: "Logged In!",
                description: "Welcome back.",
            });
            router.push('/');
        } catch (error: any) {
            handleAuthError(error.code);
        }
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your email below to login to your account.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="m@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center">
                                    <FormLabel>Password</FormLabel>
                                    <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                                        Forgot your password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <FormControl>
                                        <Input type={showPassword ? 'text' : 'password'} {...field} />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-0 right-0 h-full px-3 text-muted-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting}>
                       {form.formState.isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                </CardContent>
                <CardFooter className="flex-col gap-3 text-sm">
                    <div className="flex justify-center">
                         Don't have an account? <Link href="/signup" className="underline ml-1">Sign up</Link>
                    </div>
                    <Link href="/" className="underline text-muted-foreground">Back to Home</Link>
                </CardFooter>
            </form>
        </Form>
    )
}
