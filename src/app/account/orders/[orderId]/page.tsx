'use client';

import { useParams, useRouter } from 'next/navigation';
import { orders, products } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { orderId } = params;

  const order = orders.find(o => o.id === orderId);

  // For demonstration, we'll just show some products as if they were in the order
  const orderItems = products.slice(0, order?.itemCount || 2); 

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <p className="text-muted-foreground">The order you are looking for does not exist.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const badgeVariant = order.status === "Delivered" ? "default" : order.status === "Cancelled" ? "destructive" : "secondary";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Order Details</CardTitle>
          <CardDescription className="mt-1">
            Order ID: <span className="font-medium text-foreground">{order.id}</span>
          </CardDescription>
           <CardDescription>
            Placed on: <span className="font-medium text-foreground">{order.date}</span>
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Badge variant={badgeVariant}>{order.status}</Badge>
            <span className="font-bold text-lg">₦{order.total.toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Separator />
        <div className="my-6">
            <h3 className="font-semibold mb-4">Items in this Order ({order.itemCount})</h3>
            <div className="space-y-4">
                {orderItems.map(item => {
                    const image = PlaceHolderImages.find(p => p.id === item.imageId);
                    return (
                        <div key={item.id} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                {image && <Image src={image.imageUrl} alt={item.name} fill className="object-cover" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">x1</p>
                            </div>
                            <p className="font-semibold">₦{item.price.toFixed(2)}</p>
                        </div>
                    )
                })}
            </div>
        </div>
        <Separator />
         <div className="grid md:grid-cols-2 gap-8 my-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Shipping Address</h3>
                <p className="text-muted-foreground">
                    {order.customerName}<br />
                    123 Main Street<br />
                    Lagos, 100242<br />
                    Nigeria
                </p>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold">Payment Summary</h3>
                <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₦{(order.total * 0.94).toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span>Service Charge (6%):</span>
                    <span>₦{(order.total * 0.06).toFixed(2)}</span>
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
      <CardFooter>
         <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
         </Button>
      </CardFooter>
    </Card>
  );
}
