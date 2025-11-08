
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProducts } from '@/hooks/use-products';
import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { collection, collectionGroup, getDocs, query, where } from 'firebase/firestore';
import type { Order, OrderItem, UserProfile } from '@/lib/data';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export default function AnalyticsPage() {
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collectionGroup(firestore, 'orders');
    }, [firestore]);
    
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: allOrders, loading: ordersLoading } = useCollection<Order>(ordersQuery);
    const { data: allUsers, loading: usersLoading } = useCollection<UserProfile>(usersQuery);
    const { products, loading: productsLoading } = useProducts();
    const [allOrderItems, setAllOrderItems] = useState<OrderItem[]>([]);
    const [itemsLoading, setItemsLoading] = useState(true);

    useEffect(() => {
        const fetchAllItems = async () => {
            if (!firestore || !allOrders.length) {
                setItemsLoading(false);
                return;
            };

            setItemsLoading(true);
            const itemPromises = allOrders.map(order => {
                 // The parent of an order is the user document.
                const userDocId = (order as any).ref.parent.parent.id;
                const itemsRef = collection(firestore, 'users', userDocId, 'orders', order.id, 'items');
                return getDocs(itemsRef);
            });
            
            const itemSnapshots = await Promise.all(itemPromises);
            const allItems: OrderItem[] = [];
            itemSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    allItems.push(doc.data() as OrderItem);
                })
            })
            setAllOrderItems(allItems);
            setItemsLoading(false);
        }
        
        if (!ordersLoading) {
            fetchAllItems();
        }

    }, [allOrders, firestore, ordersLoading]);


  const analyticsData = useMemo(() => {
    const deliveredOrders = allOrders.filter((o) => o.status === 'Delivered');
    const totalRevenue = deliveredOrders.reduce((acc, o) => acc + o.total, 0);
    const totalOrders = allOrders.length;
    const totalCustomers = allUsers.length;
    const averageOrderValue =
      deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
    const monthlyGoal = 500000;
    const monthlyGoalProgress = (totalRevenue / monthlyGoal) * 100;

    const salesByProduct = allOrderItems.reduce((acc, item) => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
        return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(salesByProduct)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([productId, sales]) => {
            const product = products.find(p => p.id === productId);
            return {
                id: productId,
                name: product?.name || 'Unknown Product',
                sales: sales
            };
        });

    const orderStatusData = allOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const salesByCategory = allOrderItems.reduce((acc, item) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return acc;
        
        const categoryKey = product.category === 'soup' ? 'Soups' : 'Foodstuff';
        const sales = item.price * item.quantity;
        acc[categoryKey] = (acc[categoryKey] || 0) + sales;
        return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      monthlyGoal,
      monthlyGoalProgress,
      topProducts,
      orderStatusData,
      salesByCategory
    };
  }, [allOrders, allUsers, products, allOrderItems]);
  
  const totalCategorySales = Object.values(analyticsData.salesByCategory).reduce((sum, current) => sum + current, 0);

  const loading = ordersLoading || usersLoading || productsLoading || itemsLoading;

  if (loading) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Analytics</h1>
                <p className="text-muted-foreground">
                An overview of your store's performance.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <Skeleton className="h-4 w-2/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-3/4" />
                            <Skeleton className="h-3 w-2/4 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                         <Skeleton className="h-6 w-1/2" />
                         <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                    </CardContent>
                </Card>
                <div className="lg:col-span-3 flex flex-col gap-4">
                     <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                     <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                </div>
            </div>
        </div>
    )
  }


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Analytics</h1>
        <p className="text-muted-foreground">
          An overview of your store's performance.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{analyticsData.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From all delivered orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
             <p className="text-xs text-muted-foreground">Across all statuses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalCustomers}</div>
             <p className="text-xs text-muted-foreground">Registered user accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{analyticsData.averageOrderValue.toFixed(2)}
            </div>
             <p className="text-xs text-muted-foreground">Based on delivered orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Selling Products */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Your most popular products by units sold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product) => (
                <div key={product.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground">{product.sales} units</span>
                  </div>
                  <Progress value={(product.sales / (analyticsData.topProducts[0]?.sales || 1)) * 100} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Goal & Order Status */}
        <div className="lg:col-span-3 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Goal Tracker</CardTitle>
                    <CardDescription>
                        Tracking your progress towards your revenue goal of ₦{analyticsData.monthlyGoal.toLocaleString()}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={analyticsData.monthlyGoalProgress} className="h-4" />
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                        {analyticsData.monthlyGoalProgress.toFixed(1)}% complete
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Order Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {Object.entries(analyticsData.orderStatusData).map(([status, count]) => (
                             <TableRow key={status}>
                                <TableCell className="font-medium">{status}</TableCell>
                                <TableCell className="text-right">{count as number}</TableCell>
                             </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
      
       {/* Sales by Category */}
      <Card>
        <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>A breakdown of your revenue by product category.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(analyticsData.salesByCategory).map(([category, sales]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">₦{(sales as number).toLocaleString()}</span>
                  </div>
                  <Progress value={(sales as number / totalCategorySales) * 100} />
                </div>
              ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
