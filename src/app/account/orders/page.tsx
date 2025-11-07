
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOrders } from "@/hooks/use-orders";
import type { Order } from '@/lib/data';
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const getBadgeVariant = (status: Order['status']) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'Shipped': return 'secondary';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
}

export default function OrderHistoryPage() {
  const { orders, loading } = useOrders();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>
          A list of your past and current orders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : orders.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        You haven't placed any orders yet.
                    </TableCell>
                </TableRow>
            ) : (
                orders.map((order) => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
                    <TableCell>{format(order.createdAt.toDate(), 'MMMM d, yyyy')}</TableCell>
                    <TableCell>
                    <Badge variant={getBadgeVariant(order.status)}>
                        {order.status}
                    </Badge>
                    </TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell className="text-right">₦{order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/account/orders/${order.id}`}>View Details</Link>
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
