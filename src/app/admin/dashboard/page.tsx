'use client';

import { DollarSign, FileText, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { month: "Jan", sales: 186, revenue: 80 },
  { month: "Feb", sales: 305, revenue: 200 },
  { month: "Mar", sales: 237, revenue: 120 },
  { month: "Apr", sales: 73, revenue: 190 },
  { month: "May", sales: 209, revenue: 130 },
  { month: "Jun", sales: 214, revenue: 140 },
];

const revenueData = [
    { date: '2024-05-01', revenue: 550 },
    { date: '2024-05-02', revenue: 680 },
    { date: '2024-05-03', revenue: 430 },
    { date: '2024-05-04', revenue: 810 },
    { date: '2024-05-05', revenue: 760 },
    { date: '2024-05-06', revenue: 920 },
    { date: '2024-05-07', revenue: 780 },
]

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
                        <div className="text-2xl font-bold">₦45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+235</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,234</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">57</div>
                        <p className="text-xs text-muted-foreground">2 orders need attention</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales & Revenue</CardTitle>
                        <CardDescription>January - June 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <RechartsBarChart accessibilityLayer data={salesData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
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
                            <RechartsLineChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short'})} />
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
