
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, ShoppingCart, ThumbsUp, ThumbsDown, Edit } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { QuoteStatus } from '@/lib/data';

// Mock data for a quote - in a real app this would be fetched from your database
const mockQuote = {
    id: 'QT-001',
    date: '2024-05-22',
    status: 'Quote Ready' as QuoteStatus,
    items: [
        { name: 'Fresh Ugba', quantity: 2, measure: 'Wraps', price: 3000 },
        { name: 'Stockfish Head', quantity: 1, measure: 'Pieces', price: 15000 },
    ],
    notes: "Please make sure the Ugba is very fresh.",
    shipping: {
        method: 'Delivery within Lagos',
        address: '123 Main Street, Ikeja, Lagos',
        cost: 1200,
    },
    costs: {
        itemsTotal: 21000,
        serviceCharge: 1260, // 6% of itemsTotal
        shipping: 1200,
        total: 23460,
    }
};

const mockPendingQuote = {
    ...mockQuote,
    id: 'QT-002',
    status: 'Pending Review' as QuoteStatus,
    costs: null,
    items: [{ name: 'Live Goat', quantity: 1, measure: 'Pieces', price: null }]
};

export default function QuoteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { quoteId } = params;
  const { toast } = useToast();

  const [quote, setQuote] = useState(quoteId === 'QT-001' ? mockQuote : mockPendingQuote);
  
  const handleAccept = () => {
    setQuote(q => ({...q, status: 'Accepted'}));
    toast({
        title: "Quote Accepted!",
        description: "You can now proceed to payment.",
    })
  }
  
  const handleReject = () => {
      setQuote(q => ({...q, status: 'Rejected'}));
      toast({
        variant: "destructive",
        title: "Quote Rejected",
        description: "This quote has been marked as rejected.",
    })
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold">Quote not found</h2>
        <p className="text-muted-foreground">The quote you are looking for does not exist.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }
  
  let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "secondary";
  if (quote.status === 'Quote Ready') badgeVariant = 'default';
  if (quote.status === 'Accepted') badgeVariant = 'outline';
  if (quote.status === 'Expired' || quote.status === 'Rejected') badgeVariant = 'destructive';

  const showActionButtons = quote.status === 'Quote Ready';
  const showPaymentButton = quote.status === 'Accepted';

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Quote Details</CardTitle>
          <CardDescription className="mt-1">
            Quote ID: <span className="font-medium text-foreground">{quote.id}</span>
          </CardDescription>
           <CardDescription>
            Requested on: <span className="font-medium text-foreground">{quote.date}</span>
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Badge variant={badgeVariant}>{quote.status}</Badge>
            {quote.costs && <span className="font-bold text-lg">₦{quote.costs.total.toFixed(2)}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <Separator />
        
        {quote.status === 'Pending Review' && (
            <Alert className="my-6">
                <FileText className="h-4 w-4" />
                <AlertTitle>This quote is under review.</AlertTitle>
                <AlertDescription>
                    We have received your request and are working on a price for you. You will be notified once your quote is ready.
                </AlertDescription>
            </Alert>
        )}
        {quote.status === 'Rejected' && (
             <Alert variant="destructive" className="my-6">
                <ThumbsDown className="h-4 w-4" />
                <AlertTitle>Quote Rejected</AlertTitle>
                <AlertDescription>
                    You have rejected this quote. If you changed your mind, please submit a new custom order request.
                </AlertDescription>
            </Alert>
        )}

        <div className="my-6">
            <h3 className="font-semibold mb-4">Requested Items</h3>
            <div className="space-y-4">
                {quote.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 text-sm">
                        <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-muted-foreground">Quantity: {item.quantity} {item.measure}</p>
                        </div>
                        {item.price ? <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p> : <p className="text-muted-foreground">To be quoted</p>}
                    </div>
                ))}
            </div>
             {quote.notes && (
                <div className="mt-4 text-sm p-3 bg-muted/50 rounded-md">
                    <p><span className="font-semibold">Your Notes:</span> <span className="italic text-muted-foreground">"{quote.notes}"</span></p>
                </div>
            )}
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-8 my-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Shipping Details</h3>
                <p className="text-muted-foreground text-sm">
                    Method: {quote.shipping.method}<br />
                    {quote.shipping.address}
                </p>
            </div>
             {quote.costs && (
                <div className="space-y-2">
                    <h3 className="font-semibold">Cost Breakdown</h3>
                    <div className="flex justify-between text-sm">
                        <span>Items Total:</span>
                        <span>₦{quote.costs.itemsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Service Charge (6%):</span>
                        <span>₦{quote.costs.serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>₦{quote.costs.shipping.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2"/>
                    <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>₦{quote.costs.total.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch sm:flex-row sm:justify-between gap-2">
         <Button variant="outline" onClick={() => router.push('/account/quotes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotes
         </Button>

         <div className="flex flex-col sm:flex-row gap-2">
             {showActionButtons && (
                <>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="destructive" className="w-full sm:w-auto">
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to reject this quote?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. You will have to submit a new request if you change your mind.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReject} className="bg-destructive hover:bg-destructive/90">Reject Quote</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button variant="outline" className="w-full sm:w-auto" asChild>
                        <Link href="/custom-order">
                             <Edit className="mr-2 h-4 w-4" />
                            Edit Request
                        </Link>
                    </Button>

                    <Button className="w-full sm:w-auto" onClick={handleAccept}>
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Accept Quote
                    </Button>
                </>
             )}
             <Button className="w-full sm:w-auto" disabled={!showPaymentButton}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Proceed to Payment
            </Button>
         </div>
      </CardFooter>
    </Card>
  );
}
