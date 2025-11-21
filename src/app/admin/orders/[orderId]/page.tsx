
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Order, OrderItem, UserProfile } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Truck, PackageCheck, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/notifications';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { doc, getDoc, getDocs, query, collectionGroup, where, limit, setDoc, collection, DocumentReference } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const getBadgeVariant = (status: Order['status']) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'Shipped': return 'secondary';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
}

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { orderId } = params;

  const [orderRef, setOrderRef] = useState<DocumentReference | null>(null);
  
  // Since we don't know the userId from the orderId alone, we have to find it first.
  // This efficient query finds the single order document from across all user sub-collections.
  useEffect(() => {
    const findOrder = async () => {
        if (!firestore || !orderId) return;
        const q = query(collectionGroup(firestore, 'orders'), where('__name__', '==', `orders/${orderId}`), limit(1));
        const orderSnap = await getDocs(q);
        
        if (!orderSnap.empty) {
          const doc = orderSnap.docs[0];
          setOrderRef(doc.ref);
        } else {
            console.warn(`Order with ID ${orderId} not found in any user's subcollection.`);
            setOrderRef(null); // Explicitly set to null if not found
        }
    };
    
    findOrder();
  }, [firestore, orderId]);
  
  const { data: order, loading: orderLoading } = useDoc<Order>(orderRef);
  
  const itemsRef = useMemoFirebase(() => {
    if (!orderRef) return null;
    return collection(orderRef, 'items');
  }, [orderRef]);

  const { data: orderItems, loading: itemsLoading } = useCollection<OrderItem>(itemsRef);

  const customerId = orderRef?.parent.parent?.id;
  
  const userDocRef = useMemoFirebase(() => {
      if (!firestore || !customerId) return null;
      return doc(firestore, 'users', customerId);
  }, [firestore, customerId]);

  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(userDocRef);


  const handleStatusChange = async (newStatus: Order['status']) => {
      if (order && orderRef && customerId && firestore) {
          try {
            await setDoc(orderRef, { status: newStatus }, { merge: true });
            toast({
                title: "Order Status Updated",
                description: `Order #${order.id.substring(0, 6)} has been marked as ${newStatus}.`
            });
            
            if (newStatus === 'Shipped') {
               createNotification(firestore, {
                  recipient: 'user',
                  userId: customerId,
                  title: 'Your Order has Shipped!',
                  description: `Your order #${order.id.substring(0, 6)} is on its way.`,
                  href: `/account/orders/${order.id}`,
                  icon: 'Truck',
              });
            }
             if (newStatus === 'Delivered') {
               createNotification(firestore, {
                  recipient: 'user',
                  userId: customerId,
                  title: 'Your Order has been Delivered!',
                  description: `We hope you enjoy your items from order #${order.id.substring(0, 6)}.`,
                  href: `/account/orders/${order.id}`,
                  icon: 'PackageCheck',
              });
            }
          } catch (error) {
             toast({ variant: 'destructive', title: 'Update Failed' });
          }
      }
  };


  if (orderLoading || itemsLoading || !orderRef || userProfileLoading) {
    return (
        <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Separator />
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-8 my-6">
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40 mt-1" />
                    <Skeleton className="h-4 w-32 mt-1" />
                  </div>
                   <Skeleton className="h-24 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
  }
  
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <p className="text-muted-foreground">The order you are looking for does not exist.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const serviceCharge = order.total * 0.06;
  const subtotal = order.total - serviceCharge; // Simplified for this example

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Order Details</CardTitle>
          <CardDescription className="mt-1">
            Order ID: <span className="font-medium text-foreground">#{order.id.substring(0, 6)}</span>
          </CardDescription>
           <CardDescription>
            Customer ID: <span className="font-medium text-foreground">#{customerId.substring(0, 6)}</span>
          </CardDescription>
           <CardDescription>
            Placed on: <span className="font-medium text-foreground">{format(order.createdAt.toDate(), 'MMMM d, yyyy')}</span>
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
            <span className="font-bold text-lg">₦{order.total.toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Separator />
        <div className="my-6">
            <h3 className="font-semibold mb-4">Items in this Order ({order.itemCount})</h3>
            <div className="space-y-4">
                {orderItems.map(item => {
                    // @ts-ignore - imageId isn't on OrderItem, but should be.
                    const image = item.imageId;
                    return (
                        <div key={item.id} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                {image && <Image src={image} alt={item.name} fill className="object-cover" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                            </div>
                            <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    )
                })}
            </div>
        </div>
        <Separator />
         <div className="grid md:grid-cols-2 gap-8 my-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Customer & Shipping</h3>
                <p className="text-muted-foreground">
                    {userProfile ? (
                      <>
                        {userProfile.firstName} {userProfile.lastName}<br />
                        {userProfile.shippingAddress.split('\\n').map((line, i) => <span key={i}>{line}<br/></span>) || 'No shipping address provided'}
                      </>
                    ) : 'Customer details not available.'}
                </p>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold">Payment Summary</h3>
                <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₦{subtotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span>Service Charge (6%):</span>
                    <span>₦{serviceCharge.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>₦0.00</span>
                </div>
                <Separator className="my-2"/>
                 <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₦{order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
         <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
         </Button>
         <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href={`/admin/orders/${orderId}/invoice`} target="_blank">
                    <FileText className="mr-2 h-4 w-4"/>
                    Print Invoice
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>Update Status</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {(['Pending', 'Awaiting Confirmation', 'Shipped', 'Delivered', 'Cancelled'] as Order['status'][]).map(status => (
                        <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)} disabled={order.status === status}>
                            {status}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </CardFooter>
    </Card>
  );
}
