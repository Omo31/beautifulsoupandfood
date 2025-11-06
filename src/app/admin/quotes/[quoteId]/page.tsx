
'use client';

import { useState, useMemo } from 'react';
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
import type { QuoteStatus } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import notificationStore from '@/lib/notifications';

type QuoteItem = {
    name: string;
    quantity: number;
    measure: string;
    unitCost: number;
};

type QuoteService = {
    name: string;
    cost: number;
};

// Mock data for a quote - in a real app this would be fetched from your database
const mockPendingQuote = {
    id: 'QT-002',
    date: '2024-05-21',
    status: 'Pending Review' as QuoteStatus,
    customer: {
        name: 'Chioma Okoro',
        email: 'chioma.okoro@example.com',
        phone: '+234 802 345 6789'
    },
    items: [
        { name: 'Live Goat', quantity: 1, measure: 'Pieces', unitCost: 0 },
        { name: 'Basket of Tomatoes', quantity: 1, measure: 'Custom', unitCost: 0 },
    ],
    services: [
        { name: 'Special Packaging', cost: 0 }
    ],
    notes: "I need the goat for a party on Saturday, please ensure it's healthy. For the tomatoes, a medium-sized basket is fine. Please package the tomatoes carefully so they don't bruise.",
    shipping: {
        method: 'Request Shipping Quote',
        address: '55 Adebayo Street, Surulere, Lagos',
        cost: 0,
    }
};

export default function AdminQuoteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { quoteId } = params;
  const { toast } = useToast();

  const [quote, setQuote] = useState(mockPendingQuote);
  
  const handleUnitCostChange = (index: number, value: string) => {
    const newItems = [...quote.items];
    newItems[index].unitCost = parseFloat(value) || 0;
    setQuote({...quote, items: newItems});
  };

  const handleServiceCostChange = (index: number, value: string) => {
      const newServices = [...quote.services];
      newServices[index].cost = parseFloat(value) || 0;
      setQuote({...quote, services: newServices});
  };
  
  const handleShippingCostChange = (value: string) => {
    setQuote({
        ...quote, 
        shipping: {...quote.shipping, cost: parseFloat(value) || 0}
    });
  };

  const handleSendQuote = () => {
    // In a real app, this would update the quote in the database.
    setQuote(q => ({...q, status: 'Quote Ready'}));

    notificationStore.addNotification({
        recipient: 'user',
        title: 'Quote Ready!',
        description: `Your quote ${quote.id} is now ready for your review.`,
        href: `/account/quotes/${quote.id}`,
        icon: FileText,
    });

    toast({
        title: "Quote Sent!",
        description: `The quote has been sent to ${quote.customer.name}.`,
    });

    router.push('/admin/quotes');
  }

  const { itemsTotal, servicesTotal, subTotal, serviceCharge, grandTotal } = useMemo(() => {
    const itemsTotal = quote.items.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
    const servicesTotal = quote.services.reduce((acc, service) => acc + service.cost, 0);
    const subTotal = itemsTotal + servicesTotal;
    const serviceCharge = subTotal * 0.06;
    const grandTotal = subTotal + serviceCharge + quote.shipping.cost;
    return { itemsTotal, servicesTotal, subTotal, serviceCharge, grandTotal };
  }, [quote.items, quote.services, quote.shipping.cost]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Quote Request Details</CardTitle>
          <CardDescription className="mt-1">
            Quote ID: <span className="font-medium text-foreground">{quote.id}</span>
          </CardDescription>
        </div>
        <Badge variant={quote.status === 'Pending Review' ? 'secondary' : 'default'}>{quote.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                {/* Items to Price */}
                <div>
                    <h3 className="font-semibold mb-4 text-lg">Requested Items</h3>
                    <div className="space-y-4">
                        {quote.items.map((item, index) => (
                            <Card key={index} className="p-4 bg-muted/50">
                                <div className="grid grid-cols-[1fr_auto_auto] items-end gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity} {item.measure}</p>
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
                                        />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Line Total</p>
                                        <p className="font-semibold">₦{(item.unitCost * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Services to Price */}
                {quote.services.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">Add-on Services</h3>
                        <div className="space-y-4">
                            {quote.services.map((service, index) => (
                                <Card key={index} className="p-4 bg-muted/50">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            {service.name.includes('Wrapping') ? <Gift className="h-4 w-4 text-muted-foreground" /> : <Package className="h-4 w-4 text-muted-foreground" />}
                                            <p className="font-medium">{service.name}</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`service-cost-${index}`} className="text-xs">Service Cost (₦)</Label>
                                            <Input
                                                id={`service-cost-${index}`}
                                                type="number"
                                                placeholder="0.00"
                                                className="w-28 h-9"
                                                value={service.cost || ''}
                                                onChange={e => handleServiceCostChange(index, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shipping */}
                <div>
                    <h3 className="font-semibold mb-2 text-lg">Shipping</h3>
                    <p className="text-sm">
                        <span className="font-medium">Address:</span> {quote.shipping.address}
                    </p>
                     <div className="grid gap-1.5 mt-4 max-w-xs">
                        <Label htmlFor="shipping-cost">Shipping Cost (₦)</Label>
                        <Input
                            id="shipping-cost"
                            type="number"
                            placeholder="0.00"
                            value={quote.shipping.cost || ''}
                            onChange={e => handleShippingCostChange(e.target.value)}
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
                        <p><strong>Name:</strong> {quote.customer.name}</p>
                        <p><strong>Email:</strong> {quote.customer.email}</p>
                        <p><strong>Phone:</strong> {quote.customer.phone}</p>
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
                        <div className="flex justify-between">
                            <span>Services Total:</span>
                            <span>₦{servicesTotal.toFixed(2)}</span>
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
                            <span>₦{quote.shipping.cost.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Grand Total:</span>
                            <span>₦{grandTotal.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                 {quote.notes && (
                    <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Customer Notes</AlertTitle>
                        <AlertDescription className="italic">
                        "{quote.notes}"
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
            <Button variant="secondary">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with Customer
            </Button>
            <Button onClick={handleSendQuote}>
                <Send className="mr-2 h-4 w-4" />
                Send Quote to Customer
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
