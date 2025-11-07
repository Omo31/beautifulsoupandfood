
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { doc, setDoc } from 'firebase/firestore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, ShoppingCart, ThumbsUp, ThumbsDown, Edit } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { QuoteRequest, QuoteStatus } from '@/lib/data';
import { format } from 'date-fns';


const getBadgeVariant = (status: QuoteStatus) => {
    let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "secondary";
    if (status === 'Quote Ready') badgeVariant = 'default';
    if (status === 'Accepted') badgeVariant = 'outline';
    if (status === 'Expired' || status === 'Rejected') badgeVariant = 'destructive';
    return badgeVariant;
}


export default function QuoteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { quoteId } = params;
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const quoteRef = useMemoFirebase(() => {
    if (!firestore || !quoteId) return null;
    return doc(firestore, 'quotes', quoteId as string);
  }, [firestore, quoteId]);
  
  const { data: quote, loading } = useDoc<QuoteRequest>(quoteRef);

  const handleStatusUpdate = async (newStatus: QuoteStatus) => {
    if (!quoteRef || !quote) return;

    try {
        await setDoc(quoteRef, { status: newStatus }, { merge: true });
        toast({
            title: newStatus === 'Accepted' ? 'Quote Accepted!' : 'Quote Rejected',
            description: newStatus === 'Accepted' ? 'You can now proceed to payment.' : 'This quote has been marked as rejected.',
            variant: newStatus === 'Rejected' ? 'destructive' : 'default',
        });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update the quote status.' });
    }
  };
  
  // Basic check to prevent users from viewing other people's quotes
  const canView = !loading && quote && quote.userId === user?.uid;

  if (loading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-4 w-3/4" />
                <Separator />
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
  }

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold">Quote not found</h2>
        <p className="text-muted-foreground">The quote you are looking for does not exist or you don't have permission to view it.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const showActionButtons = quote.status === 'Quote Ready';
  const showPaymentButton = quote.status === 'Accepted';

  // These would be calculated from priced data in a real scenario
  const mockCosts = {
    itemsTotal: quote.items.length * 4000,
    serviceCharge: (quote.items.length * 4000) * 0.06,
    shipping: 1500,
    total: (quote.items.length * 4000 * 1.06) + 1500,
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Quote Details</CardTitle>
          <CardDescription className="mt-1">
            Quote ID: <span className="font-medium text-foreground">#{quote.id?.substring(0,6)}</span>
          </CardDescription>
           <CardDescription>
            Requested on: <span className="font-medium text-foreground">{format(quote.createdAt.toDate(), 'MMMM d, yyyy')}</span>
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Badge variant={getBadgeVariant(quote.status)}>{quote.status}</Badge>
            {mockCosts && (quote.status === 'Quote Ready' || quote.status === 'Accepted') && <span className="font-bold text-lg">₦{mockCosts.total.toFixed(2)}</span>}
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
                            <p className="text-muted-foreground">Quantity: {item.quantity} {item.measure === 'custom' ? item.customMeasure : item.measure}</p>
                        </div>
                        {(quote.status === 'Quote Ready' || quote.status === 'Accepted') 
                            ? <p className="font-semibold">₦{(mockCosts.itemsTotal / quote.items.length).toFixed(2)}</p> 
                            : <p className="text-muted-foreground">To be quoted</p>
                        }
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
                    Method: {quote.shippingMethod}<br />
                    {quote.shippingAddress}
                </p>
            </div>
            {(quote.status === 'Quote Ready' || quote.status === 'Accepted') && (
                <div className="space-y-2">
                    <h3 className="font-semibold">Cost Breakdown</h3>
                    <div className="flex justify-between text-sm">
                        <span>Items Total:</span>
                        <span>₦{mockCosts.itemsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Service Charge (6%):</span>
                        <span>₦{mockCosts.serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>₦{mockCosts.shipping.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2"/>
                    <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>₦{mockCosts.total.toFixed(2)}</span>
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
                                <AlertDialogAction onClick={() => handleStatusUpdate('Rejected')} className="bg-destructive hover:bg-destructive/90">Reject Quote</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button variant="outline" className="w-full sm:w-auto" disabled>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Request
                    </Button>

                    <Button className="w-full sm:w-auto" onClick={() => handleStatusUpdate('Accepted')}>
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
