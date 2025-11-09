
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Send, MessageSquare, Gift, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { QuoteStatus, QuoteRequest, QuoteItem } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/notifications';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { doc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type PricedQuoteItem = QuoteItem & { unitCost?: number };

const getBadgeVariant = (status: QuoteStatus) => {
    switch (status) {
        case 'Quote Ready': return 'default';
        case 'Accepted': case 'Paid': return 'outline';
        case 'Expired':
        case 'Rejected': 
            return 'destructive';
        case 'Pending Review':
        default:
            return 'secondary';
    }
}


export default function AdminQuoteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { quoteId } = params;
  const { toast } = useToast();
  const firestore = useFirestore();

  const quoteRef = useMemoFirebase(() => {
    if (!firestore || !quoteId) return null;
    return doc(firestore, 'quotes', quoteId as string);
  }, [firestore, quoteId]);
  
  const { data: initialQuote, loading } = useDoc<QuoteRequest>(quoteRef);
  
  const [quoteItems, setQuoteItems] = useState<PricedQuoteItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    if (initialQuote) {
      // @ts-ignore
      setQuoteItems(initialQuote.items.map(item => ({ ...item, unitCost: item.unitCost || 0 })));
      // @ts-ignore
      setShippingCost(initialQuote.shippingCost || 0);
    }
  }, [initialQuote]);

  
  const handleUnitCostChange = (index: number, value: string) => {
    const newItems = [...quoteItems];
    newItems[index].unitCost = parseFloat(value) || 0;
    setQuoteItems(newItems);
  };
  
  const handleShippingCostChange = (value: string) => {
    setShippingCost(parseFloat(value) || 0);
  };

  const handleSendQuote = async () => {
    if (!quoteRef || !initialQuote) return;
    if(!firestore) return;

    try {
        await setDoc(quoteRef, { 
            status: 'Quote Ready',
            items: quoteItems,
            shippingCost: shippingCost,
        }, { merge: true });

        createNotification(firestore, {
            recipient: 'user',
            userId: initialQuote.userId,
            title: 'Your Quote is Ready!',
            description: `Your quote #${initialQuote.id?.substring(0,6)} is now ready for your review.`,
            href: `/account/quotes/${initialQuote.id}`,
            icon: 'FileText',
        });

        toast({
            title: "Quote Sent!",
            description: `The quote has been sent to ${initialQuote.name}.`,
        });

        router.push('/admin/quotes');
    } catch (error) {
         toast({
            variant: 'destructive',
            title: "Send Failed",
            description: `Could not send the quote.`,
        });
    }
  }

  const { itemsTotal, subTotal, serviceCharge, grandTotal } = useMemo(() => {
    const itemsTotal = quoteItems.reduce((acc, item) => acc + ((item.unitCost || 0) * item.quantity), 0);
    const subTotal = itemsTotal; // Services can be added later
    const serviceCharge = subTotal * 0.06;
    const grandTotal = subTotal + serviceCharge + shippingCost;
    return { itemsTotal, subTotal, serviceCharge, grandTotal };
  }, [quoteItems, shippingCost]);
  
  if (loading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="space-y-6">
                 <Skeleton className="h-4 w-3/4" />
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
  }

  if (!initialQuote) {
    return <div>Quote not found.</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Quote Request Details</CardTitle>
          <CardDescription className="mt-1">
            Quote ID: <span className="font-medium text-foreground">#{initialQuote.id?.substring(0,6)}</span>
          </CardDescription>
        </div>
        <Badge variant={getBadgeVariant(initialQuote.status)}>{initialQuote.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                {/* Items to Price */}
                <div>
                    <h3 className="font-semibold mb-4 text-lg">Requested Items</h3>
                    <div className="space-y-4">
                        {quoteItems.map((item, index) => (
                            <Card key={index} className="p-4 bg-muted/50">
                                <div className="grid grid-cols-[1fr_auto_auto] items-end gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity} {item.measure === 'custom' ? item.customMeasure : item.measure}</p>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`unit-cost-${index}`} className="text-xs">Unit Cost (₦)</Label>
                                        <Input
                                            id={`unit-cost-${index}`}
                                            type="number"
                                            placeholder="0.00"
                                            className="w-28 h-9"
                                            value={item.unitCost || ''}
                                            onChange={e => handleUnitCostChange(index, e.target.value)}
                                            readOnly={initialQuote.status !== 'Pending Review'}
                                        />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Line Total</p>
                                        <p className="font-semibold">₦{((item.unitCost || 0) * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {initialQuote.services && initialQuote.services.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">Add-on Services</h3>
                         <p className="text-sm text-muted-foreground">Services pricing is not yet implemented.</p>
                    </div>
                )}

                {/* Shipping */}
                <div>
                    <h3 className="font-semibold mb-2 text-lg">Shipping</h3>
                    <p className="text-sm">
                        <span className="font-medium">Address:</span> {initialQuote.shippingAddress}
                    </p>
                     <div className="grid gap-1.5 mt-4 max-w-xs">
                        <Label htmlFor="shipping-cost">Shipping Cost (₦)</Label>
                        <Input
                            id="shipping-cost"
                            type="number"
                            placeholder="0.00"
                            value={shippingCost || ''}
                            onChange={e => handleShippingCostChange(e.target.value)}
                            readOnly={initialQuote.status !== 'Pending Review'}
                        />
                    </div>
                </div>
            </div>

             <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Name:</strong> {initialQuote.name}</p>
                        <p><strong>Email:</strong> {initialQuote.email}</p>
                        <p><strong>Phone:</strong> {initialQuote.phone}</p>
                    </CardContent>
                </Card>
                
                {/* Quote Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Quote Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>Items Total:</span>
                            <span>₦{itemsTotal.toFixed(2)}</span>
                        </div>
                        <Separator className="my-1"/>
                         <div className="flex justify-between font-medium">
                            <span>Subtotal:</span>
                            <span>₦{subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Service Charge (6%):</span>
                            <span>₦{serviceCharge.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>₦{shippingCost.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Grand Total:</span>
                            <span>₦{grandTotal.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                 {initialQuote.notes && (
                    <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Customer Notes</AlertTitle>
                        <AlertDescription className="italic">
                        "{initialQuote.notes}"
                        </AlertDescription>
                    </Alert>
                )}
             </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quotes List
        </Button>
        <div className="flex items-center gap-2">
            <Button 
                variant="secondary" 
                onClick={() => router.push(`/admin/conversations?userId=${initialQuote.userId}`)}
            >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with Customer
            </Button>
            {initialQuote.status === 'Pending Review' && (
                <Button onClick={handleSendQuote}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Quote to Customer
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
