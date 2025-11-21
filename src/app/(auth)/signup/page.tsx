
'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { initializeFirebase } from "@/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, getAuth } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { createNotification } from "@/lib/notifications";
import { Eye, EyeOff } from "lucide-react";

const signupSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    terms: z.literal<boolean>(true, {
        errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
});

type SignupFormValues = z.infer<typeof signupSchema>;


export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    
    const { auth, firestore } = useMemo(() => {
        const app = initializeFirebase();
        return {
            auth: getAuth(app),
            firestore: getFirestore(app)
        };
    }, []);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            terms: false,
        },
    });

    async function onSubmit(data: SignupFormValues) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;
            const fullName = `${data.firstName} ${data.lastName}`;

            await updateProfile(user, {
                displayName: fullName,
            });

            await sendEmailVerification(user);

            const userProfile = {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: "",
                shippingAddress: "",
                role: "Customer",
                createdAt: serverTimestamp(),
                wishlist: []
            };

            const userDocRef = doc(firestore, "users", user.uid);
            setDoc(userDocRef, userProfile).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create',
                    requestResourceData: userProfile,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
            
            // Create a notification for the admin
            createNotification(firestore, {
              recipient: 'admin',
              title: 'New User Registered',
              description: `${fullName} has just created an account.`,
              href: `/admin/users?userId=${user.uid}`, // Direct link to user if needed
              icon: 'Users',
            });
            
            toast({
                title: "Account Created!",
                description: "We've sent a verification link to your email. Please verify to log in.",
            });
            
            if (auth.currentUser) {
              await auth.signOut();
            }
            router.push('/login');

        } catch (error: any) {
             let description = "An unexpected error occurred. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                description = "This email is already in use. Please log in or use a different email.";
            }
            toast({
                variant: "destructive",
                title: "Signup Failed",
                description,
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create an Account</CardTitle>
                    <CardDescription>Enter your information to get started.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Max" className="capitalize" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Robinson" className="capitalize" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
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
                                <FormLabel>Password</FormLabel>
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
                    <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 pt-2">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id="terms" />
                                </FormControl>
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="terms" className="text-sm font-normal">
                                        I agree to the <Link href="/terms" className="underline">Terms and Conditions</Link>
                                    </Label>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating Account..." : "Create an account"}
                    </Button>
                </CardContent>
                <CardFooter className="flex-col gap-3 text-sm">
                    <div className="flex justify-center">
                        Already have an account? <Link href="/login" className="underline ml-1">Login</Link>
                    </div>
                    <Link href="/" className="underline text-muted-foreground">Back to Home</Link>
                </CardFooter>
            </form>
        </Form>
    )
}
