

'use client';

import { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Truck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TooltipProvider } from '@/components/ui/tooltip';
import { lagosLgas as defaultLgas } from '@/lib/shipping';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useSettings } from '@/hooks/use-settings';


const customItemSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    quantity: z.coerce.number({invalid_type_error: 'Quantity is required'}).min(1, "Quantity must be at least 1"),
    measure: z.string().min(1, "Please select a unit"),
    customMeasure: z.string().optional(),
}).refine(data => {
    return data.measure !== 'custom' || (data.measure === 'custom' && data.customMeasure && data.customMeasure.length > 0);
}, {
    message: "Custom unit is required",
    path: ["customMeasure"],
});

const customOrderSchema = z.object({
    items: z.array(customItemSchema).min(1, "Please add at least one item."),
    services: z.array(z.string()).optional(),
    notes: z.string().optional(),
    shippingMethod: z.enum(["pickup", "lagos", "quote"]),
    lga: z.string().optional(),
    shippingAddress: z.string().optional(),
    name: z.string().min(1, "Your name is required"),
    email: z.string().email("A valid email is required"),
    phone: z.string().min(1, "Your phone number is required"),
}).refine(data => {
    return data.shippingMethod !== 'lagos' || (data.shippingMethod === 'lagos' && data.lga);
}, {
    message: "Please select your location",
    path: ["lga"],
}).refine(data => {
    return data.shippingMethod === 'pickup' || (data.shippingMethod !== 'pickup' && data.shippingAddress);
}, {
    message: "Full shipping address is required for delivery.",
    path: ["shippingAddress"],
});


type CustomOrderFormValues = z.infer<typeof customOrderSchema>;


export default function CustomOrderPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const { settings } = useSettings();
    
    const measures = settings?.customOrder?.measures || ['Grams (g)', 'Kilograms (kg)', 'Pieces', 'Bunches', 'Wraps', 'Custom...'];
    const addonServices = settings?.customOrder?.services || ['Gift Wrapping', 'Special Packaging'];
    const lagosLgas = settings?.shipping?.lagosLgas || defaultLgas;

    const form = useForm<CustomOrderFormValues>({
        resolver: zodResolver(customOrderSchema),
        defaultValues: {
            items: [{ name: '', quantity: 1, measure: '', customMeasure: '' }],
            shippingMethod: 'pickup',
            services: [],
            notes: '',
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    });
    
    const shippingMethod = form.watch('shippingMethod');
    const selectedLga = form.watch('lga');
    
    const shippingFee = useMemo(() => {
        if (shippingMethod === 'pickup' || shippingMethod === 'quote') {
            return 0;
        }
        if (shippingMethod === 'lagos' && selectedLga) {
            const lga = lagosLgas.find(l => l.id === selectedLga);
            return lga ? lga.price : 0;
        }
        return 0;
    }, [shippingMethod, selectedLga, lagosLgas]);

    const getShippingFeeDisplay = () => {
        if (shippingMethod === 'pickup') return '₦0.00';
        if (shippingMethod === 'quote') return 'To be quoted';
        if (shippingMethod === 'lagos') {
            return selectedLga ? `₦${shippingFee.toFixed(2)}` : 'Select a location';
        }
        return 'To be quoted';
    };

    const onSubmit = async (data: CustomOrderFormValues) => {
        if (!firestore) {
            toast({ variant: 'destructive', title: "Database error", description: "Could not connect to the database." });
            return;
        }
        if (!user) {
            toast({ variant: 'destructive', title: "Not logged in", description: "You must be logged in to submit a quote request." });
            router.push('/login');
            return;
        }

        const quoteRequestData = {
            ...data,
            userId: user.uid,
            status: 'Pending Review',
            createdAt: serverTimestamp(),
        };

        const quotesCollection = collection(firestore, 'quotes');
        addDoc(quotesCollection, quoteRequestData)
            .then(() => {
                toast({
                    title: 'Request Sent!',
                    description: 'Your custom order request has been submitted. We will notify you once a quote is ready.'
                });
                router.push('/account/quotes');
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: quotesCollection.path,
                    operation: 'create',
                    requestResourceData: quoteRequestData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    return (
        <TooltipProvider>
            <div className="max-w-4xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-3xl font-headline">Custom Order Request</CardTitle>
                                <CardDescription>
                                    Can't find what you're looking for? Let us know, and we'll do our best to source it for you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Items Section */}
                                <div className="space-y-4">
                                    <Label className="text-lg font-medium">Requested Items</Label>
                                    {fields.map((field, index) => (
                                        <Card key={field.id} className="p-4 bg-muted/50">
                                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-4 items-start">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Item Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., Fresh Ugba" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                 <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Quantity</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" placeholder="1" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.measure`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Unit of Measure</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select a unit" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {measures.map(measure => (
                                                                            <SelectItem key={measure} value={measure}>{measure}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex items-end h-full pb-2">
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} className="text-muted-foreground hover:text-destructive">
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {form.watch(`items.${index}.measure`) === 'Custom...' && (
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.customMeasure`}
                                                    render={({ field }) => (
                                                        <FormItem className="mt-4">
                                                            <FormLabel>Custom Unit</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., A small basket" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </Card>
                                    ))}
                                    <FormMessage>{form.formState.errors.items?.root?.message}</FormMessage>
                                    <Button type="button" variant="outline" onClick={() => append({ name: '', quantity: 1, measure: '', customMeasure: '' })} className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
                                    </Button>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="services"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-lg font-medium">Add-on Services</FormLabel>
                                            </div>
                                            <div className="grid gap-2 rounded-lg border p-4">
                                                {addonServices.map((service) => (
                                                <FormField
                                                    key={service}
                                                    control={form.control}
                                                    name="services"
                                                    render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                        key={service}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                        <FormControl>
                                                            <Checkbox
                                                            checked={field.value?.includes(service)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                ? field.onChange([...(field.value || []), service])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                    (value) => value !== service
                                                                    )
                                                                )
                                                            }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {service}
                                                        </FormLabel>
                                                        </FormItem>
                                                    )
                                                    }}
                                                />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-medium">Notes & Instructions</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Provide any specific details, like brand, size, or preparation style for any of your items." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Shipping */}
                                <FormField
                                    control={form.control}
                                    name="shippingMethod"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-lg font-medium">Delivery Options</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                                >
                                                    <FormItem>
                                                        <Label htmlFor="pickup" className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/10 has-[[data-state=checked]]:bg-accent/10 has-[[data-state=checked]]:border-primary">
                                                            <FormControl>
                                                                <RadioGroupItem value="pickup" id="pickup" />
                                                            </FormControl>
                                                            <span>
                                                                In-Store Pickup
                                                                <p className="text-sm text-muted-foreground">Collect your order directly from our location.</p>
                                                            </span>
                                                        </Label>
                                                    </FormItem>
                                                    <FormItem>
                                                         <Label htmlFor="lagos" className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/10 has-[[data-state=checked]]:bg-accent/10 has-[[data-state=checked]]:border-primary">
                                                            <FormControl>
                                                                <RadioGroupItem value="lagos" id="lagos" />
                                                            </FormControl>
                                                            <span>
                                                                Delivery within Lagos
                                                                <p className="text-sm text-muted-foreground">Select your location for a pre-set delivery fee.</p>
                                                            </span>
                                                        </Label>
                                                    </FormItem>
                                                    <FormItem>
                                                        <Label htmlFor="quote" className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/10 has-[[data-state=checked]]:bg-accent/10 has-[[data-state=checked]]:border-primary">
                                                            <FormControl>
                                                                <RadioGroupItem value="quote" id="quote" />
                                                            </FormControl>
                                                            <span>
                                                                Request Shipping Quote
                                                                <p className="text-sm text-muted-foreground">We will calculate and send you a shipping quote.</p>
                                                            </span>
                                                        </Label>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {(shippingMethod === 'lagos' || shippingMethod === 'quote') && (
                                    <div className="grid gap-4 mt-4">
                                        {shippingMethod === 'lagos' && (
                                            <FormField
                                                control={form.control}
                                                name="lga"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Select Location (LGA)</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Choose your Local Government Area" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {lagosLgas.map(lga => (
                                                                    <SelectItem key={lga.id} value={lga.id}>
                                                                        {lga.name} - ₦{lga.price.toFixed(2)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Shipping Address</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Please enter your full street address, landmark, etc." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                                {shippingMethod !== 'pickup' && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                                        <Truck className="h-4 w-4" />
                                        <span className="font-bold">Estimated delivery: 2-4 working days</span>
                                    </div>
                                )}

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
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Your Name</FormLabel>
                                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Your Email</FormLabel>
                                                    <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Your Phone Number</FormLabel>
                                                    <FormControl><Input type="tel" placeholder="+234 801 234 5678" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()} className="w-full">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Submitting...' : 'Submit Request for Quote'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
        </TooltipProvider>
    )
}

    

