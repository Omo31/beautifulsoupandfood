'use client';

import Image from "next/image";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Info } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { products } from "@/lib/data";
import { lagosLgas } from "@/lib/shipping";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function CartPage() {
    const [shippingMethod, setShippingMethod] = useState("pickup");
    const [selectedLga, setSelectedLga] = useState<string | null>(null);
    const initialCartItems = useMemo(() => products.slice(1, 3).map(p => ({ ...p, quantity: 1 })), []);
    const [cartItems, setCartItems] = useState(initialCartItems);

    const handleQuantityChange = (productId: string, change: 'increase' | 'decrease') => {
        setCartItems(currentItems =>
            currentItems.map(item => {
                if (item.id === productId) {
                    const newQuantity = change === 'increase' ? item.quantity + 1 : item.quantity - 1;
                    return { ...item, quantity: Math.max(1, newQuantity) };
                }
                return item;
            })
        );
    };
    
    const handleRemoveItem = (productId: string) => {
        setCartItems(currentItems => currentItems.filter(item => item.id !== productId));
    };

    const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cartItems]);
    const serviceCharge = subtotal * 0.06;

    const shippingFee = useMemo(() => {
        if (shippingMethod === 'pickup' || shippingMethod === 'quote') {
            return 0;
        }
        if (shippingMethod === 'lagos' && selectedLga) {
            const lga = lagosLgas.find(l => l.id === selectedLga);
            return lga ? lga.price : 0;
        }
        return 0;
    }, [shippingMethod, selectedLga]);

    const total = subtotal + serviceCharge + shippingFee;
    
    const isPaymentDisabled = () => {
        if (cartItems.length === 0) return true;
        if (shippingMethod === 'quote') return true;
        if (shippingMethod === 'lagos' && !selectedLga) return true;
        return false;
    }


    return (
        <TooltipProvider>
            <div>
                <h1 className="text-4xl font-bold font-headline mb-8">Your Cart</h1>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card>
                            <CardContent className="p-0">
                                {cartItems.length > 0 ? (
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
                                                            <p className="text-sm text-muted-foreground">₦{item.price.toFixed(2)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 border rounded-md p-1">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, 'decrease')} disabled={item.quantity <= 1}><Minus className="h-3 w-3"/></Button>
                                                            <span>{item.quantity}</span>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, 'increase')}><Plus className="h-3 w-3"/></Button>
                                                        </div>
                                                        <p className="font-semibold w-20 text-right">₦{(item.price * item.quantity).toFixed(2)}</p>
                                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                    {index < cartItems.length - 1 && <Separator />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                                        <p>Your cart is empty.</p>
                                        <Button asChild>
                                            <Link href="/shop">Continue Shopping</Link>
                                        </Button>
                                    </div>
                                )}
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
                                            In-Store Pickup
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-pointer"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Collect your order directly from our location after payment.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="lagos" id="lagos-delivery"/>
                                        <Label htmlFor="lagos-delivery">Delivery within Lagos</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="quote" id="quote"/>
                                        <Label htmlFor="quote">Other (Request Quote)</Label>
                                    </div>
                                </RadioGroup>

                                {shippingMethod === 'lagos' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="lga-select">Select Location (LGA)</Label>
                                        <Select onValueChange={setSelectedLga}>
                                            <SelectTrigger id="lga-select">
                                                <SelectValue placeholder="Choose your Local Government Area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {lagosLgas.map(lga => (
                                                    <SelectItem key={lga.id} value={lga.id}>
                                                        {lga.name} - ₦{lga.price.toFixed(2)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Textarea placeholder="Full shipping address..." className="mt-2" />
                                    </div>
                                )}
                                
                                {shippingMethod === 'quote' ? (
                                    <>
                                        <Card className="bg-muted/50">
                                            <CardContent className="pt-6">
                                                <form className="space-y-4">
                                                    <Label>Shipping Address</Label>
                                                    <Textarea placeholder="Please enter your full shipping address here. Be as descriptive as possible." />
                                                    <Button size="sm" className="w-full">Submit for Shipping Quote</Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                        <Alert>
                                          <Info className="h-4 w-4" />
                                          <AlertTitle>Next Steps</AlertTitle>
                                          <AlertDescription>
                                            After submitting your address, we will calculate the shipping cost and notify you. You will need to accept the quote before payment is enabled.
                                          </AlertDescription>
                                        </Alert>
                                    </>
                                ) : null}

                                <Separator/>
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₦{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Service Charge (6%)</span>
                                    <span>₦{serviceCharge.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping Fee</span>
                                    <span>
                                        {shippingMethod === 'pickup' && '₦0.00'}
                                        {shippingMethod === 'quote' && 'To be determined'}
                                        {shippingMethod === 'lagos' && `₦${shippingFee.toFixed(2)}`}
                                    </span>
                                </div>

                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₦{total.toFixed(2)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" disabled={isPaymentDisabled()}>
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
