'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
    const { user, loading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        // If user is logged in and verified, redirect them away from this page
        if (user && user.emailVerified) {
            router.replace('/');
        }
        // If not loading and no user, redirect to login
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);
    
    const handleResendVerification = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "You are not logged in."});
            return;
        }
        setIsSending(true);
        try {
            await sendEmailVerification(user);
            toast({
                title: "Verification Email Sent",
                description: "A new verification link has been sent to your email address.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error Sending Email",
                description: "There was a problem sending the email. Please try again later.",
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleLogout = async () => {
        if (auth) {
            await auth.signOut();
            router.push('/login');
        }
    };

    return (
        <>
            <CardHeader>
                <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                <CardDescription>
                    We've sent a verification link to <strong>{user?.email}</strong>. Please check your inbox and click the link to continue.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <p className="text-sm text-muted-foreground">
                    Once you've verified, you can refresh this page or log in again to access the application.
                </p>
                <Button onClick={handleResendVerification} disabled={isSending}>
                    {isSending ? "Sending..." : "Resend Verification Email"}
                </Button>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <p className="text-xs text-muted-foreground">
                    Wrong account? <button onClick={handleLogout} className="underline">Logout</button>
                </p>
            </CardFooter>
        </>
    );
}
