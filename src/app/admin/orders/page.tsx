
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo } from 'react';
import { collectionGroup, getDocs, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Order } from "@/lib/data";
import { useOrders as useMockOrders } from "@/hooks/use-orders-mock"; // Using mock for admin for now
import { format } from "date-fns";

const getBadgeVariant = (status: Order['status']) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'Shipped': return 'secondary';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
}

export default function OrdersPage() {
  // We'll use the mock store for the admin page for now
  // In a real app, you'd fetch all orders using an admin SDK or a cloud function
  const { orders } = useMockOrders();
  
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
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{format(new Date(order.date || Date.now()), 'MMMM d, yyyy')}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
