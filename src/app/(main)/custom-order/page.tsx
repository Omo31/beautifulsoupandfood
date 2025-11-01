'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function CustomOrderPage() {
    const router = useRouter();
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Custom Order Request</CardTitle>
                    <CardDescription>
                        Can't find what you're looking for? Let us know, and we'll do our best to source it for you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="item-name">Item Name</Label>
                            <Input id="item-name" placeholder="e.g., Fresh Ugba" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" placeholder="e.g., 2 wraps or 500g" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Provide any specific details, like brand, size, or preparation style." />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input id="name" placeholder="John Doe" required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input id="email" type="email" placeholder="john.doe@example.com" required />
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full">
                                Cancel
                            </Button>
                            <Button type="submit" className="w-full">
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
