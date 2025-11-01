'use client';

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Info } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { products } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function CartPage() {
    const [shippingMethod, setShippingMethod] = useState("pickup");
    const cartItems = products.slice(1, 3); // Mock cart items
    const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
    const serviceCharge = subtotal * 0.06;
    const total = subtotal + serviceCharge;

    return (
        <TooltipProvider>
            <div>
                <h1 className="text-4xl font-bold font-headline mb-8">Your Cart</h1>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card>
                            <CardContent className="p-0">
                                <div className="flex flex-col">
                                    {cartItems.map((item, index) => {
                                        const image = PlaceHolderImages.find(p => p.id === item.imageId);
                                        return (
                                            <div key={item.id}>
                                                <div className="flex items-center gap-4 p-4">
                                                    <div className="relative h-24 w-24 rounded-md overflow-hidden">
                                                        {image && <Image src={image.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint={image.imageHint} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{item.name}</h3>
                                                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 border rounded-md p-1">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6"><Minus className="h-3 w-3"/></Button>
                                                        <span>1</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-3 w-3"/></Button>
                                                    </div>
                                                    <p className="font-semibold w-20 text-right">${item.price.toFixed(2)}</p>
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                                {index < cartItems.length - 1 && <Separator />}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                                    <Label>Delivery Options</Label>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <RadioGroupItem value="pickup" id="pickup"/>
                                        <Label htmlFor="pickup" className="flex items-center">
                                            Pickup (Free)
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-pointer"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Collect your order directly from our location. <br/> No shipping fees apply.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="delivery" id="delivery"/>
                                        <Label htmlFor="delivery">Set Shipping Fee</Label>
                                    </div>
                                </RadioGroup>
                                
                                {shippingMethod === 'delivery' && (
                                    <Card className="bg-muted/50">
                                        <CardContent className="pt-6">
                                            <form className="space-y-4">
                                                <Label>Shipping Address</Label>
                                                 <Input placeholder="Full Name" />
                                                <Input placeholder="Street Address" />
                                                <Input placeholder="City" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input placeholder="State/Province" />
                                                    <Input placeholder="ZIP/Postal Code" />
                                                </div>
                                                <Button size="sm" className="w-full">Submit for Shipping Quote</Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}

                                <Separator/>
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Service Charge (6%)</span>
                                    <span>${serviceCharge.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping Fee</span>
                                    <span>{shippingMethod === 'pickup' ? '$0.00' : 'To be determined'}</span>
                                </div>

                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" disabled={shippingMethod === 'delivery'}>
                                    Proceed to Payment
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
