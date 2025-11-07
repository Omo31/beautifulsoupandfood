'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemoFirebase } from '@/firebase/utils';
import type { UserProfile } from '@/lib/data';

const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
        }
    });

    useEffect(() => {
        if (userProfile) {
            form.reset({
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                email: user?.email || '',
            });
        }
    }, [userProfile, user, form]);

    const handleUpdate = async (data: ProfileFormValues) => {
        if (!firestore || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not logged in' });
            return;
        }

        try {
            await setDoc(doc(firestore, 'users', user.uid), {
                firstName: data.firstName,
                lastName: data.lastName,
            }, { merge: true });

            toast({
                title: "Success!",
                description: `Your profile has been updated.`,
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Update failed",
                description: "Could not update your profile. Please try again.",
            });
        }
    }
    
    if (userLoading || profileLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Update your personal information and manage your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(handleUpdate)}>
                        <div className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                            <Input type="email" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        <div className="flex gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </div>
                    </form>
                </Form>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <form className="space-y-4 mt-4" onSubmit={(e) => {e.preventDefault(); toast({title: "Coming Soon!", description: "Password changes will be available in a future update."})}}>
                        <div className="grid gap-2">
                            <FormLabel htmlFor="current-password">Current Password</FormLabel>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="grid gap-2">
                            <FormLabel htmlFor="new-password">New Password</FormLabel>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="grid gap-2">
                            <FormLabel htmlFor="confirm-password">Confirm New Password</FormLabel>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit">Change Password</Button>
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
