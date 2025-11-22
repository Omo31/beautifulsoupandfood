
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
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/utils';

type AnalyticsData = {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    monthlyGoal: number;
    monthlyGoalProgress: number;
    topProductsByUnits: { id: string; name: string; value: number; isUnits: boolean; }[];
    topProductsByRevenue: { id: string; name: string; value: number; isUnits: boolean; }[];
    orderStatusData: Record<string, number>;
    salesByCategory: Record<string, number>;
};


export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const functions = useMemo(() => getFunctions(), []);
    const { settings } = useSettings();
    const firestore = useFirestore();

    // Listen to orders and users collections to trigger re-fetch
    const ordersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: orders } = useCollection(ordersQuery);
    const { data: users } = useCollection(usersQuery);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            // This single Cloud Function call gets all the data we need.
            const getAnalytics = httpsCallable<void, AnalyticsData>(functions, 'getDashboardAnalytics');
            const result = await getAnalytics();
            setAnalyticsData(result.data);
        } catch (error: any) {
            console.error("Error fetching analytics:", error);
            toast({
                variant: 'destructive',
                title: 'Failed to load analytics',
                description: error.message || 'There was a problem retrieving analytics data.'
            });
        } finally {
            setLoading(false);
        }
    }, [functions, toast]);

    // Fetch initial data, and re-fetch whenever orders or users collections change
    useEffect(() => {
        fetchAnalytics();
    }, [orders, users, fetchAnalytics]);
    
    const totalCategorySales = useMemo(() => {
        if (!analyticsData || !analyticsData.salesByCategory) return 0;
        return Object.values(analyticsData.salesByCategory).reduce((sum, current) => sum + current, 0);
    }, [analyticsData]);

  if (loading || !analyticsData) {
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
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                         <Skeleton className="h-6 w-1/2" />
                         <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <Skeleton className="h-6 w-1/2" />
                         <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                         <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
                <div className="lg:col-span-3 flex flex-col gap-4">
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

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Selling Products by Units */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products (by Units)</CardTitle>
            <CardDescription>
              Your most popular products by quantity sold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.topProductsByUnits.length > 0 ? (
                <div className="space-y-4">
                {analyticsData.topProductsByUnits.map((product) => (
                    <div key={product.id}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-muted-foreground">{product.value} units</span>
                    </div>
                    <Progress value={(product.value / (analyticsData.topProductsByUnits[0]?.value || 1)) * 100} />
                    </div>
                ))}
                </div>
            ) : <p className="text-sm text-muted-foreground">No sales data available yet.</p>}
          </CardContent>
        </Card>
        
        {/* Top Selling Products by Revenue */}
         <Card>
          <CardHeader>
            <CardTitle>Top Selling Products (by Revenue)</CardTitle>
            <CardDescription>
              Your most profitable products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.topProductsByRevenue.length > 0 ? (
                <div className="space-y-4">
                {analyticsData.topProductsByRevenue.map((product) => (
                    <div key={product.id}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-muted-foreground">₦{product.value.toLocaleString()}</span>
                    </div>
                    <Progress value={(product.value / (analyticsData.topProductsByRevenue[0]?.value || 1)) * 100} />
                    </div>
                ))}
                </div>
            ) : <p className="text-sm text-muted-foreground">No sales data available yet.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
       <Card className="lg:col-span-4">
        <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>A breakdown of your revenue by product category.</CardDescription>
        </CardHeader>
        <CardContent>
            {totalCategorySales > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(analyticsData.salesByCategory).map(([category, sales]) => (
                    <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">₦{(sales as number).toLocaleString()}</span>
                    </div>
                    <Progress value={((sales as number) / totalCategorySales) * 100} />
                    </div>
                ))}
                </div>
            ): <p className="text-sm text-muted-foreground">No sales data available yet.</p>}
        </CardContent>
      </Card>
        {/* Monthly Goal & Order Status */}
        <div className="lg:col-span-3 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Goal Tracker</CardTitle>
                    <CardDescription>
                        Tracking your progress towards your revenue goal of ₦{(settings?.store.monthlyRevenueGoal || 0).toLocaleString()}.
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
                    {Object.keys(analyticsData.orderStatusData).length > 0 ? (
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
                    ) : <p className="text-sm text-muted-foreground">No order data available yet.</p>}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    