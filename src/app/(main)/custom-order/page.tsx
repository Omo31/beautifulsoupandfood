
'use client';

import { useState, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Info, Plus, Minus, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { lagosLgas } from '@/lib/shipping';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import notificationStore from '@/lib/notifications';

type CustomItem = {
    id: number;
    name: string;
    quantity: number;
    measure: string;
    customMeasure: string;
};

const addonServices = ['Gift Wrapping', 'Special Packaging'];

export default function CustomOrderPage() {
    const router = useRouter();
    const { toast } = useToast();
    const nextId = useRef(1);
    const [items, setItems] = useState<CustomItem[]>([{ id: 0, name: '', quantity: 1, measure: '', customMeasure: '' }]);
    const [shippingMethod, setShippingMethod] = useState('pickup');
    const [selectedLga, setSelectedLga] = useState<string | null>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [notes, setNotes] = useState('');

    const handleAddItem = () => {
        setItems([...items, { id: nextId.current++, name: '', quantity: 1, measure: '', customMeasure: '' }]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: keyof Omit<CustomItem, 'id' | 'quantity'>, value: string) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };
    
    const handleQuantityChange = (id: number, change: 'increase' | 'decrease') => {
        setItems(items.map(item => {
            if (item.id === id) {
                const newQuantity = change === 'increase' ? item.quantity + 1 : item.quantity - 1;
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        }));
    };

    const handleServiceChange = (serviceName: string, checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedServices(prev => [...prev, serviceName]);
        } else {
            setSelectedServices(prev => prev.filter(s => s !== serviceName));
        }
    };

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

    const getShippingFeeDisplay = () => {
        if (shippingMethod === 'pickup') return '₦0.00';
        if (shippingMethod === 'quote') return 'To be quoted';
        if (shippingMethod === 'lagos') {
            return selectedLga ? `₦${shippingFee.toFixed(2)}` : 'Select a location';
        }
        return 'To be quoted';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        notificationStore.addNotification({
            recipient: 'admin',
            title: 'New Quote Request',
            description: 'A new custom order has been submitted for review.',
            href: '/admin/quotes/QT-002', 
            icon: FileText
        });

        toast({
            title: 'Request Sent!',
            description: 'Your custom order request has been submitted. We will notify you once a quote is ready.'
        });

        router.push('/account/quotes');
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
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Items Section */}
                            <div className="space-y-4">
                                <Label className="text-lg font-medium">Requested Items</Label>
                                {items.map((item, index) => (
                                    <Card key={item.id} className="p-4 bg-muted/50">
                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-4 items-end">
                                            <div className="grid gap-2">
                                                <Label htmlFor={`item-name-${item.id}`}>Item Name</Label>
                                                <Input id={`item-name-${item.id}`} placeholder="e.g., Fresh Ugba" required onChange={e => handleItemChange(item.id, 'name', e.target.value)} />
                                            </div>
                                             <div className="grid gap-2">
                                                <Label>Quantity</Label>
                                                <div className="flex items-center gap-2 border rounded-md p-1 bg-background">
                                                    <Button variant="ghost" size="icon" type="button" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, 'decrease')} disabled={item.quantity <= 1}><Minus className="h-3 w-3"/></Button>
                                                    <span>{item.quantity}</span>
                                                    <Button variant="ghost" size="icon" type="button" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, 'increase')}><Plus className="h-3 w-3"/></Button>
                                                </div>
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
                                    {addonServices.map(service => (
                                        <div key={service} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={service.toLowerCase().replace(' ', '-')}
                                                onCheckedChange={(checked) => handleServiceChange(service, checked)}
                                            />
                                            <Label htmlFor={service.toLowerCase().replace(' ', '-')}>{service}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Notes */}
                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-lg font-medium">Notes & Instructions</Label>
                                <Textarea id="description" placeholder="Provide any specific details, like brand, size, or preparation style for any of your items." value={notes} onChange={(e) => setNotes(e.target.value)} />
                            </div>

                            {/* Shipping */}
                            <div className="space-y-4">
                                <Label className="text-lg font-medium">Delivery Options</Label>
                                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <Label htmlFor="pickup" className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/10 has-[[data-state=checked]]:bg-accent/10 has-[[data-state=checked]]:border-primary">
                                        <RadioGroupItem value="pickup" id="pickup" />
                                        <span>
                                            In-Store Pickup
                                            <p className="text-sm text-muted-foreground">Collect your order directly from our location.</p>
                                        </span>
                                    </Label>
                                    <Label htmlFor="lagos" className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/10 has-[[data-state=checked]]:bg-accent/10 has-[[data-state=checked]]:border-primary">
                                        <RadioGroupItem value="lagos" id="lagos" />
                                        <span>
                                            Delivery within Lagos
                                             <p className="text-sm text-muted-foreground">Select your location for a pre-set delivery fee.</p>
                                        </span>
                                    </Label>
                                    <Label htmlFor="quote" className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/10 has-[[data-state=checked]]:bg-accent/10 has-[[data-state=checked]]:border-primary">
                                        <RadioGroupItem value="quote" id="quote" />
                                        <span>
                                            Request Shipping Quote
                                            <p className="text-sm text-muted-foreground">We will calculate and send you a shipping quote.</p>
                                        </span>
                                    </Label>
                                </RadioGroup>
                                
                                {(shippingMethod === 'lagos' || shippingMethod === 'quote') && (
                                    <div className="grid gap-4 mt-4">
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
                                            </div>
                                        )}
                                        <div className="grid gap-2">
                                            <Label htmlFor="shipping-address">Full Shipping Address</Label>
                                            <Textarea id="shipping-address" placeholder="Please enter your full street address, landmark, etc." required />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quote Summary */}
                            <div className="space-y-2 rounded-lg border p-4">
                                <h3 className="font-medium text-lg">Quote Summary</h3>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Cost of Items & Services</span>
                                    <span className="font-medium">To be quoted</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Service Charge (6%)</span>
                                    <span className="font-medium">To be quoted</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping Fee</span>
                                    <span>{getShippingFeeDisplay()}</span>
                                </div>
                                <Separator className="my-2"/>
                                 <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>To be quoted</span>
                                </div>
                            </div>


                            {/* User Info */}
                            <div className="space-y-4">
                                <Label className="text-lg font-medium">Your Info</Label>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Your Name</Label>
                                        <Input id="name" placeholder="John Doe" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Your Email</Label>
                                        <Input id="email" type="email" placeholder="john.doe@example.com" required />
                                    </div>
                                     <div className="grid gap-2">
                                        <Label htmlFor="phone">Your Phone Number</Label>
                                        <Input id="phone" type="tel" placeholder="+234 801 234 5678" required />
                                    </div>
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
