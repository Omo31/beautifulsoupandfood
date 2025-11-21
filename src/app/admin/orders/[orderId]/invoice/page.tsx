
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import type { Order, OrderItem, UserProfile } from '@/lib/data';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { doc, collection, DocumentReference } from 'firebase/firestore';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InvoicePage() {
    const router = useRouter();
    const params = useParams();
    const { orderId } = params;
    const firestore = useFirestore();

    const orderRef = useMemoFirebase(() => {
        if (!firestore || !orderId) return null;
        return doc(firestore, 'orders', orderId as string);
    }, [firestore, orderId]);
  
    const { data: order, loading: orderLoading } = useDoc<Order>(orderRef);
    
    const itemsRef = useMemoFirebase(() => {
        if (!orderRef) return null;
        return collection(orderRef, 'items');
    }, [orderRef]);

    const { data: orderItems, loading: itemsLoading } = useCollection<OrderItem>(itemsRef);

    const customerId = order?.userId;
    
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !customerId) return null;
        return doc(firestore, 'users', customerId);
    }, [firestore, customerId]);

    const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

    const isLoading = orderLoading || itemsLoading || userProfileLoading;

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <Skeleton className="h-[80vh] w-full" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center h-screen flex-col gap-4">
                <p>Order not found.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }
    
    const serviceCharge = order.total * 0.06;
    const subtotal = order.total - serviceCharge; // Simplified for this example

    return (
        <div className="max-w-4xl mx-auto bg-card p-8 sm:p-12 my-8 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <Logo />
                    <p className="text-muted-foreground text-sm mt-2">BeautifulSoup&Food<br/>Lekki, Lagos, Nigeria</p>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
                    <p className="text-muted-foreground">#{order.id.substring(0, 6)}</p>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 my-6 text-sm">
                <div>
                    <p className="font-semibold text-muted-foreground">BILL TO</p>
                    <p className="font-medium">{userProfile?.firstName} {userProfile?.lastName}</p>
                    <p>{userProfile?.shippingAddress?.split('\\n').map((line, i) => <span key={i}>{line}<br/></span>) || 'No shipping address'}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-semibold text-muted-foreground">Invoice Date: </span> {format(order.createdAt.toDate(), 'MMMM d, yyyy')}</p>
                    <p><span className="font-semibold text-muted-foreground">Payment Status: </span> Paid</p>
                </div>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orderItems.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name} ({item.variantName})</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">₦{item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">₦{(item.price * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex justify-end mt-6">
                <div className="w-full max-w-sm space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>₦{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Service Charge (6%):</span>
                        <span>₦{serviceCharge.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span>₦0.00</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                        <span>Grand Total:</span>
                        <span>₦{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-xs text-muted-foreground">
                <p>Thank you for your business!</p>
                <p>If you have any questions, please contact us at support@bs&f.com.</p>
            </div>

            <div className="flex justify-center gap-2 mt-8 print:hidden">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Order
                </Button>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
            </div>
        </div>
    );
}
