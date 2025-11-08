'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        }
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        if (!auth) {
            toast({ variant: "destructive", title: "Firebase not initialized" });
            return;
        }
        try {
            await sendPasswordResetEmail(auth, data.email);
            toast({
                title: "Password Reset Link Sent",
                description: `If an account exists for ${data.email}, a reset link has been sent.`,
            });
            router.push('/login');
        } catch (error: any) {
            // We still show the success message to prevent email enumeration attacks
             toast({
                title: "Password Reset Link Sent",
                description: `If an account exists for ${data.email}, a reset link has been sent.`,
            });
            router.push('/login');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your email to receive a reset link.
                    </CardDescription>
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
                    <Button type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    <Link href="/login" className="underline">Back to Login</Link>
                </CardFooter>
            </form>
        </Form>
    )
}
