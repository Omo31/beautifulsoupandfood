
'use client';

import { DollarSign, FileText, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/utils";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--accent))",
  },
};

type AnalyticsData = {
    totalRevenue: number;
    newCustomers: number;
    totalSales: number;
    pendingOrders: number;
    salesData: { month: string; sales: number; revenue: number }[];
    revenueData: { date: string; revenue: number }[];
};

export default function AdminDashboardPage() {
    const [dashboardData, setDashboardData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const functions = useMemo(() => getFunctions(), []);
    const firestore = useFirestore();

    // Listen to orders and users collections to trigger re-fetch
    const ordersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: orders } = useCollection(ordersQuery);
    const { data: users } = useCollection(usersQuery);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const getAnalytics = httpsCallable<void, AnalyticsData>(functions, 'getDashboardAnalytics');
            const result = await getAnalytics();
            setDashboardData(result.data);
        } catch (error: any) {
            console.error("Error fetching dashboard analytics:", error);
            toast({
                variant: 'destructive',
                title: 'Failed to load dashboard',
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


    if (loading || !dashboardData) {
        return (
             <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
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
                 <div className="grid gap-4 md:grid-cols-2">
                    <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
                 </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦{dashboardData.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From delivered orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{dashboardData.newCustomers}</div>
                        <p className="text-xs text-muted-foreground">In the last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{dashboardData.totalSales}</div>
                        <p className="text-xs text-muted-foreground">Total items sold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">Orders needing fulfillment</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales & Revenue</CardTitle>
                        <CardDescription>Last 6 Months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <RechartsBarChart accessibilityLayer data={dashboardData.salesData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar yAxisId="left" dataKey="sales" fill="var(--color-sales)" radius={4} />
                                <Bar yAxisId="right" dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Last 7 Days</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <RechartsLineChart data={dashboardData.revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleString('en-US', { day: 'numeric', month: 'short'})} />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                            </RechartsLineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
