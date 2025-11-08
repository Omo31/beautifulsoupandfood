'use client';

import { DollarSign, FileText, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { collection, collectionGroup, query, where, Timestamp } from 'firebase/firestore';
import type { Order, UserProfile } from '@/lib/data';
import { Skeleton } from "@/components/ui/skeleton";
import { subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

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

export default function AdminDashboardPage() {
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

    const dashboardData = useMemo(() => {
        const deliveredOrders = allOrders.filter((o) => o.status === 'Delivered');
        const totalRevenue = deliveredOrders.reduce((acc, o) => acc + o.total, 0);
        const totalSales = deliveredOrders.reduce((acc, o) => acc + o.itemCount, 0);
        const pendingOrders = allOrders.filter(o => o.status === 'Pending' || o.status === 'Awaiting Confirmation').length;

        const oneMonthAgo = subMonths(new Date(), 1);
        const newCustomers = allUsers.filter(u => u.createdAt && u.createdAt.toDate() > oneMonthAgo).length;

        // Monthly Sales & Revenue Chart Data
        const salesData = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(new Date(), 5 - i);
            return {
                month: format(date, 'MMM'),
                sales: 0,
                revenue: 0,
            };
        });

        deliveredOrders.forEach(order => {
            const month = format(order.createdAt.toDate(), 'MMM');
            const monthIndex = salesData.findIndex(d => d.month === month);
            if (monthIndex > -1) {
                salesData[monthIndex].sales += order.itemCount;
                salesData[monthIndex].revenue += order.total;
            }
        });

        // Daily Revenue Chart Data (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const dayInterval = eachDayOfInterval({ start: sevenDaysAgo, end: new Date() });
        const revenueData = dayInterval.map(day => ({
             date: format(day, 'yyyy-MM-dd'),
             revenue: 0
        }));
        
        deliveredOrders.forEach(order => {
            const orderDate = order.createdAt.toDate();
            const matchingDay = revenueData.find(d => isSameDay(new Date(d.date), orderDate));
            if (matchingDay) {
                matchingDay.revenue += order.total;
            }
        });


        return {
            totalRevenue,
            newCustomers,
            totalSales,
            pendingOrders,
            salesData,
            revenueData
        };
    }, [allOrders, allUsers]);

    const loading = ordersLoading || usersLoading;

    if (loading) {
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
