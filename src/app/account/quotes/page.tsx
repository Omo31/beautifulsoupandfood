
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type QuoteStatus } from "@/lib/data";
import { useQuotes } from "@/hooks/use-quotes";

const getBadgeVariant = (status: QuoteStatus) => {
    switch (status) {
        case 'Quote Ready': return 'default';
        case 'Accepted': return 'outline';
        case 'Expired':
        case 'Rejected': 
            return 'destructive';
        case 'Pending Review':
        case 'Awaiting Revision':
        default:
            return 'secondary';
    }
}

export default function MyQuotesPage() {
  const { quotes } = useQuotes();
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
            {quotes.map((quote) => (
                <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>{quote.date}</TableCell>
                    <TableCell>
                    <Badge variant={getBadgeVariant(quote.status)}>
                        {quote.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {quote.total ? `₦${quote.total.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/account/quotes/${quote.id}`}>View Details</Link>
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
