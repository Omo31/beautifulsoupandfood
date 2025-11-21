
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo, useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import type { Order, UserProfile } from "@/lib/data";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { File } from 'lucide-react';
import { convertToCSV, downloadCSV } from '@/lib/csv';
import { useMemoFirebase } from "@/firebase/utils";

type AggregatedOrder = Order & { customerName: string; };

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

  // We are now using a one-time fetch to avoid real-time listener complexity
  useEffect(() => {
    const fetchOrdersAndUsers = async () => {
        if (!firestore) return;
        setLoading(true);
        try {
            // Fetch all orders from the top-level collection
            const ordersQuery = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
            const ordersSnapshot = await getDocs(ordersQuery);
            const fetchedOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

            // Create a set of unique user IDs from the orders
            const userIds = [...new Set(fetchedOrders.map(o => o.userId))];
            
            // Fetch the user profiles for these IDs
            const userProfiles: Record<string, UserProfile> = {};
            if (userIds.length > 0) {
                 // Firestore 'in' queries are limited to 10 items, so we'd need to batch this for > 10 users.
                 // For now, we fetch one by one, which is less efficient but simpler.
                await Promise.all(userIds.map(async (userId) => {
                    const userDoc = await getDoc(doc(firestore, 'users', userId));
                    if (userDoc.exists()) {
                        userProfiles[userId] = userDoc.data() as UserProfile;
                    }
                }));
            }

            // Combine the data
            const aggregatedOrders = fetchedOrders.map(order => ({
                ...order,
                customerName: userProfiles[order.userId] 
                    ? `${userProfiles[order.userId].firstName} ${userProfiles[order.userId].lastName}`
                    : `User ${order.userId.substring(0, 5)}...`
            }));
            
            setOrders(aggregatedOrders);

        } catch (error) {
            console.error("Error fetching all orders:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchOrdersAndUsers();
  }, [firestore]);

  const handleExport = () => {
      const dataToExport = orders.map(o => ({
          OrderID: o.id,
          CustomerID: o.userId,
          CustomerName: o.customerName,
          Date: format(o.createdAt.toDate(), 'yyyy-MM-dd'),
          Status: o.status,
          ItemCount: o.itemCount,
          Total: o.total,
      }));
      const csv = convertToCSV(dataToExport);
      downloadCSV(csv, `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage customer orders.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
            <File className="h-3.5 w-3.5" />
            <span>Export</span>
        </Button>
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
