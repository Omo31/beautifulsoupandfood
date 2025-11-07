
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type QuoteStatus, type QuoteRequest } from "@/lib/data";
import { useQuotes } from "@/hooks/use-quotes";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

const getBadgeVariant = (status: QuoteStatus) => {
    switch (status) {
        case 'Quote Ready': return 'default';
        case 'Accepted': return 'outline';
        case 'Expired':
        case 'Rejected': 
            return 'destructive';
        case 'Pending Review':
        default:
            return 'secondary';
    }
}

export default function MyQuotesPage() {
  const { quotes, loading } = useQuotes();

  const calculateTotal = (quote: QuoteRequest) => {
    // This is a simplified calculation for display.
    // In a real app, the priced quote details would be stored and retrieved.
    if (quote.status === 'Quote Ready' || quote.status === 'Accepted') {
      // Dummy calculation
      return quote.items.length * 5000;
    }
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Quotes</CardTitle>
        <CardDescription>
          A list of your custom order quote requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                [...Array(2)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : quotes.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        You have not requested any quotes yet.
                    </TableCell>
                </TableRow>
            ) : (
                quotes.map((quote) => {
                    const total = calculateTotal(quote);
                    return (
                        <TableRow key={quote.id}>
                            <TableCell className="font-medium">#{quote.id?.substring(0, 6)}</TableCell>
                            <TableCell>{format(quote.createdAt.toDate(), 'MMMM d, yyyy')}</TableCell>
                            <TableCell>
                            <Badge variant={getBadgeVariant(quote.status)}>
                                {quote.status}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {total ? `~₦${total.toFixed(2)}` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/account/quotes/${quote.id}`}>View Details</Link>
                            </Button>
                            </TableCell>
                        </TableRow>
                    )
                })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
