
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo, useEffect, useState } from 'react';
import { collectionGroup, getDocs, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Order } from "@/lib/data";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type AggregatedOrder = Order & { customerName: string };

const getBadgeVariant = (status: Order['status']) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'Shipped': return 'secondary';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
}

export default function OrdersPage() {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<AggregatedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
        if (!firestore) return;
        setLoading(true);
        try {
            const ordersQuery = query(collectionGroup(firestore, 'orders'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(ordersQuery);
            const fetchedOrders: AggregatedOrder[] = [];
            // In a real app with many users, you might fetch user data separately.
            // For simplicity, we'll assume user data is somehow available or part of the order.
            querySnapshot.forEach(doc => {
                fetchedOrders.push({
                    ...doc.data(),
                    id: doc.id,
                    // This is a simplification. Ideally, you'd look up the user's name from their ID.
                    customerName: `User ${doc.ref.parent.parent?.id.substring(0, 5)}...` 
                } as AggregatedOrder);
            });
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching all orders:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchOrders();
  }, [firestore]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          Manage customer orders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No orders found.
                    </TableCell>
                </TableRow>
            ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{format(order.createdAt.toDate(), 'MMMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">₦{order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/orders/${order.id}`}>View</Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
