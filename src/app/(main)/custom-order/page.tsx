'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type CustomItem = {
    id: number;
    name: string;
    quantity: string;
    measure: string;
    customMeasure: string;
};

export default function CustomOrderPage() {
    const router = useRouter();
    const [items, setItems] = useState<CustomItem[]>([{ id: 1, name: '', quantity: '', measure: '', customMeasure: '' }]);
    const [shippingMethod, setShippingMethod] = useState('pickup');

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: '', quantity: '', measure: '', customMeasure: '' }]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: keyof Omit<CustomItem, 'id'>, value: string) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    return (
        <TooltipProvider>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Custom Order Request</CardTitle>
                        <CardDescription>
                            Can't find what you're looking for? Let us know, and we'll do our best to source it for you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-8">
                            {/* Items Section */}
                            <div className="space-y-4">
                                <Label className="text-lg font-medium">Requested Items</Label>
                                {items.map((item, index) => (
                                    <Card key={item.id} className="p-4 bg-muted/50">
                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
                                            <div className="grid gap-2">
                                                <Label htmlFor={`item-name-${item.id}`}>Item Name</Label>
                                                <Input id={`item-name-${item.id}`} placeholder="e.g., Fresh Ugba" required onChange={e => handleItemChange(item.id, 'name', e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                                                <Input id={`quantity-${item.id}`} placeholder="e.g., 2" required onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor={`measure-${item.id}`}>Unit of Measure</Label>
                                                <Select onValueChange={value => handleItemChange(item.id, 'measure', value)}>
                                                    <SelectTrigger id={`measure-${item.id}`}>
                                                        <SelectValue placeholder="Select a unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="grams">Grams (g)</SelectItem>
                                                        <SelectItem value="kilograms">Kilograms (kg)</SelectItem>
                                                        <SelectItem value="pieces">Pieces</SelectItem>
                                                        <SelectItem value="bunches">Bunches</SelectItem>
                                                        <SelectItem value="wraps">Wraps</SelectItem>
                                                        <SelectItem value="custom">Custom...</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        {item.measure === 'custom' && (
                                            <div className="grid gap-2 mt-4">
                                                <Label htmlFor={`custom-measure-${item.id}`}>Custom Unit</Label>
                                                <Input id={`custom-measure-${item.id}`} placeholder="e.g., A small basket" required onChange={e => handleItemChange(item.id, 'customMeasure', e.target.value)} />
                                            </div>
                                        )}
                                    </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
                                </Button>
                            </div>

                            {/* Add-on Services */}
                            <div className="space-y-2">
                                <Label className="text-lg font-medium">Add-on Services</Label>
                                <div className="grid gap-2 rounded-lg border p-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="gift-wrapping" />
                                        <Label htmlFor="gift-wrapping">Gift Wrapping</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="special-packaging" />
                                        <Label htmlFor="special-packaging">Special Packaging</Label>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notes */}
                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-lg font-medium">Notes & Instructions</Label>
                                <Textarea id="description" placeholder="Provide any specific details, like brand, size, or preparation style for any of your items." />
                            </div>

                            {/* Shipping */}
                             <div className="space-y-4">
                                <Label className="text-lg font-medium">Delivery Options</Label>
                                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Label htmlFor="pickup" className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/10">
                                        <RadioGroupItem value="pickup" id="pickup" />
                                        <span>
                                            In-Store Pickup
                                            <p className="text-sm text-muted-foreground">Collect your order directly from our location after payment.</p>
                                        </span>
                                    </Label>
                                    <Label htmlFor="delivery" className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/10">
                                        <RadioGroupItem value="delivery" id="delivery" />
                                        <span>
                                            Set Shipping Fee
                                             <p className="text-sm text-muted-foreground">Request a quote for delivery to your address.</p>
                                        </span>
                                    </Label>
                                </RadioGroup>
                                
                                {shippingMethod === 'delivery' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="shipping-address">Shipping Address</Label>
                                        <Textarea id="shipping-address" placeholder="Please enter your full shipping address here. Be as descriptive as possible." required />
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Your Name</Label>
                                    <Input id="name" placeholder="John Doe" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Your Email</Label>
                                    <Input id="email" type="email" placeholder="john.doe@example.com" required />
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full">
                                    Cancel
                                </Button>
                                <Button type="submit" className="w-full">
                                    Submit Request for Quote
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    )
}
