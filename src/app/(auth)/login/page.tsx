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
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();

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
                description = "Invalid email or password. Please try again.";
                break;
            case 'auth/too-many-requests':
                description = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
                break;
             case 'auth/popup-closed-by-user':
                description = "The sign-in popup was closed before completing. Please try again.";
                break;
        }
        toast({
            variant: "destructive",
            title: "Login Failed",
            description,
        });
    }

    const onSubmit = async (data: LoginFormValues) => {
        if (!auth) {
            toast({ variant: "destructive", title: "Firebase not initialized" });
            return;
        }
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
    
    const handleGoogleSignIn = async () => {
        if (!auth) {
            toast({ variant: "destructive", title: "Firebase not initialized" });
            return;
        }
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast({
                title: "Logged In!",
                description: "Welcome back.",
            });
            router.push('/');
        } catch (error: any) {
            handleAuthError(error.code);
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
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
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                           {form.formState.isSubmitting ? "Logging in..." : "Login"}
                        </Button>
                    </div>
                    <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
                        Login with Google
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    Don't have an account? <Link href="/signup" className="underline ml-1">Sign up</Link>
                </CardFooter>
            </form>
        </Form>
    )
}
