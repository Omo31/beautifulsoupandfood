import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { products } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CartPage() {
    const cartItems = products.slice(1, 3); // Mock cart items
    const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
    const shipping = 5.00;
    const total = subtotal + shipping;

    return (
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
                            <RadioGroup defaultValue="delivery">
                                <Label>Delivery Options</Label>
                                <div className="flex items-center space-x-2 mt-2">
                                    <RadioGroupItem value="delivery" id="delivery"/>
                                    <Label htmlFor="delivery">Standard Delivery ($5.00)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pickup" id="pickup"/>
                                    <Label htmlFor="pickup">Pickup (Free)</Label>
                                </div>
                            </RadioGroup>
                            <Separator/>
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Proceed to Checkout</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
