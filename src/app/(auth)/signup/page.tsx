
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
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Label } from "@/components/ui/label";

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

// Shared function to handle user profile creation on first sign-in
const ensureUserProfile = async (firestore: any, user: User) => {
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        const [firstName, ...lastNameParts] = user.displayName?.split(' ') || ["", ""];
        const lastName = lastNameParts.join(' ');
        
        const userProfile = {
            firstName: firstName,
            lastName: lastName,
            phone: user.phoneNumber || "",
            shippingAddress: "",
            role: "Customer",
            createdAt: serverTimestamp(),
            wishlist: []
        };
        setDoc(userDocRef, userProfile).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: userProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }
};

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

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
        if (!auth || !firestore) {
            toast({ variant: "destructive", title: "Firebase not initialized" });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: `${data.firstName} ${data.lastName}`,
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
    
    const handleGoogleSignUp = async () => {
        if (!auth || !firestore) {
            toast({ variant: "destructive", title: "Firebase not initialized" });
            return;
        }
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await ensureUserProfile(firestore, result.user);
            
            toast({
                title: "Account Created!",
                description: "Welcome! Your account has been successfully created.",
            });
            router.push('/');
        } catch (error: any) {
            let description = "An unexpected error occurred. Please try again.";
            if (error.code === 'auth/popup-closed-by-user') {
                description = "The sign-up popup was closed before completing. Please try again.";
            } else if (error.code === 'auth/email-already-in-use') {
                 description = "This email is already associated with an account. Please log in instead.";
            }
             toast({
                variant: "destructive",
                title: "Sign-up Failed",
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
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
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
                     <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignUp}>
                        Sign up with Google
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    Already have an account? <Link href="/login" className="underline ml-1">Login</Link>
                </CardFooter>
            </form>
        </Form>
    )
}
