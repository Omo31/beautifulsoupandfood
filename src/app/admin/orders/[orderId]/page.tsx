
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Order } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Truck, PackageCheck, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import notificationStore from '@/lib/notifications';
import { useOrders as useMockOrders } from '@/hooks/use-orders-mock';
import { useProducts } from '@/hooks/use-products';
import { format } from 'date-fns';

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
  const { orderId } = params;

  // We'll use the mock store for the admin page for now
  const { findById: findOrderById, updateOrder } = useMockOrders();
  const { products } = useProducts();

  const [order, setOrder] = useState<Order | undefined>(undefined);

  useEffect(() => {
    const foundOrder = findOrderById(orderId as string);
    setOrder(foundOrder);
  }, [orderId, findOrderById]);
  
  // For demonstration, we'll just show some products as if they were in the order
  const orderItems = products.slice(0, order?.itemCount || 2); 

  const handleStatusChange = (newStatus: Order['status']) => {
      if (order) {
          const updatedOrder = {...order, status: newStatus};
          updateOrder(updatedOrder);
          setOrder(updatedOrder);
          toast({
              title: "Order Status Updated",
              description: `Order ${order.id} has been marked as ${newStatus}.`
          });
          
          if (newStatus === 'Shipped') {
             notificationStore.addNotification({
                recipient: 'user',
                title: 'Your Order has Shipped!',
                description: `Your order ${order.id} is on its way.`,
                href: `/account/orders/${order.id}`,
                icon: Truck,
            });
          }
           if (newStatus === 'Delivered') {
             notificationStore.addNotification({
                recipient: 'user',
                title: 'Your Order has been Delivered!',
                description: `We hope you enjoy your items from order ${order.id}.`,
                href: `/account/orders/${order.id}`,
                icon: PackageCheck,
            });
          }
      }
  };


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
            Order ID: <span className="font-medium text-foreground">{order.id}</span>
          </CardDescription>
           <CardDescription>
            Placed on: <span className="font-medium text-foreground">{format(new Date(order.date || Date.now()), 'MMMM d, yyyy')}</span>
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
                <h3 className="font-semibold">Customer & Shipping</h3>
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
            <Button variant="outline">
                <FileText className="mr-2 h-4 w-4"/>
                Print Invoice
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
