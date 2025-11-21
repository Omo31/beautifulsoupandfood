
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package } from 'lucide-react';
import Image from 'next/image';
import { useProducts } from '@/hooks/use-products';
import { doc, collection } from 'firebase/firestore';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import type { Order, Product, UserProfile } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type OrderItem = {
    id: string;
    name: string;
    variantName: string;
    quantity: number;
    price: number;
    productId: string;
    imageId?: string;
}

const getBadgeVariant = (status: Order['status']) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'Shipped': return 'secondary';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { orderId } = params;
  const { user } = useUser();
  const firestore = useFirestore();
  const { findById: findProductById } = useProducts();

  const orderRef = useMemoFirebase(() => {
    if (!firestore || !user || !orderId) return null;
    return doc(firestore, 'users', user.uid, 'orders', orderId as string);
  }, [firestore, user, orderId]);
  
  const { data: order, loading: orderLoading } = useDoc<Order>(orderRef);
  
  const itemsRef = useMemoFirebase(() => {
    if (!orderRef) return null;
    return collection(orderRef, 'items');
  }, [orderRef]);

  const { data: items, loading: itemsLoading } = useCollection<OrderItem>(itemsRef);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  const enrichedItems = useMemo(() => {
    return items.map(item => {
        let imageUrl = item.imageId;
        // For regular products, find the image from the product data
        if (item.productId && !item.productId.startsWith('custom-order')) {
            const product = findProductById(item.productId);
            if (product) {
                imageUrl = product.imageUrl;
            }
        }
        return { ...item, imageUrl };
    });
  }, [items, findProductById]);

  const isLoading = orderLoading || itemsLoading || profileLoading;

  if (isLoading) {
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
                <Separator />
                <Skeleton className="h-24 w-full" />
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

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 0; // This would be on the order object in a real app
  const serviceCharge = (subtotal + shippingFee) * 0.06;
  const total = subtotal + shippingFee + serviceCharge;
  

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Order Details</CardTitle>
          <CardDescription className="mt-1">
            Order ID: <span className="font-medium text-foreground">#{order.id.substring(0, 6)}</span>
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
                {enrichedItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                            {item.imageUrl && item.imageUrl !== 'custom-order' ? (
                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                            ) : (
                                <Package className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                                {item.variantName}
                            </p>
                            <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
        <Separator />
         <div className="grid md:grid-cols-2 gap-8 my-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Shipping Address</h3>
                <div className="text-muted-foreground text-sm">
                    {userProfile ? (
                        <>
                            <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                            {userProfile.shippingAddress ? (
                                userProfile.shippingAddress.split('\n').map((line, i) => (
                                    <span key={i}>{line}<br /></span>
                                ))
                            ) : (
                                <p>No shipping address on file.</p>
                            )}
                        </>
                    ) : (
                       <p>Loading shipping details...</p>
                    )}
                </div>
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
                    <span>₦{shippingFee.toFixed(2)}</span>
                </div>
                <Separator className="my-2"/>
                 <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₦{order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter>
         <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
         </Button>
      </CardFooter>
    </Card>
  );
}
