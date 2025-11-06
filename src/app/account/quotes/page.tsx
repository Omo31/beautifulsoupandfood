import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Quote = {
    id: string;
    date: string;
    status: 'Quote Ready' | 'Pending Review' | 'Accepted' | 'Expired';
    total: number | null;
};

const quotes: Quote[] = [
    { id: 'QT-001', date: '2024-05-22', status: 'Quote Ready', total: 28500.00 },
    { id: 'QT-002', date: '2024-05-21', status: 'Pending Review', total: null },
    { id: 'QT-003', date: '2024-05-18', status: 'Accepted', total: 15750.00 },
];

export default function MyQuotesPage() {
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
            {quotes.map((quote) => {
                let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "secondary";
                if (quote.status === 'Quote Ready') badgeVariant = 'default';
                if (quote.status === 'Accepted') badgeVariant = 'outline';
                if (quote.status === 'Expired') badgeVariant = 'destructive';

                return (
                    <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.id}</TableCell>
                        <TableCell>{quote.date}</TableCell>
                        <TableCell>
                        <Badge variant={badgeVariant}>
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
                );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
