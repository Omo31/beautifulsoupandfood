
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
  const [aggregatedOrders, setAggregatedOrders] = useState<AggregatedOrder[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [usersLoading, setUsersLoading] = useState(true);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    if (!firestore || orders.length === 0) {
        setUsers({});
        setUsersLoading(false);
        return;
    };
    
    const fetchUsers = async () => {
        setUsersLoading(true);
        const userIds = [...new Set(orders.map(o => o.userId))];
        const profiles: Record<string, UserProfile> = {};

        if (userIds.length > 0) {
            await Promise.all(userIds.map(async (userId) => {
                if (!users[userId]) { // Only fetch if not already in state
                    const userDoc = await getDoc(doc(firestore, 'users', userId));
                    if (userDoc.exists()) {
                        profiles[userId] = userDoc.data() as UserProfile;
                    }
                }
            }));
        }
        setUsers(prev => ({...prev, ...profiles}));
        setUsersLoading(false);
    }
    
    fetchUsers();
  }, [firestore, orders, users]);

  useEffect(() => {
    const newAggregatedOrders = orders.map(order => ({
        ...order,
        customerName: users[order.userId] 
            ? `${users[order.userId].firstName} ${users[order.userId].lastName}`
            : `User ${order.userId.substring(0, 5)}...`
    }));
    setAggregatedOrders(newAggregatedOrders);
  }, [orders, users]);
  
  const loading = ordersLoading || usersLoading;

  const handleExport = () => {
      const dataToExport = aggregatedOrders.map(o => ({
          OrderID: o.id,
          CustomerID: o.userId,
          CustomerName: o.customerName,
          Date: o.createdAt.toDate ? format(o.createdAt.toDate(), 'yyyy-MM-dd') : o.createdAt,
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
            ) : aggregatedOrders.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No orders found.
                    </TableCell>
                </TableRow>
            ) : (
                aggregatedOrders.map((order) => (
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
