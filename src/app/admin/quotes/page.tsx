
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { quotes, type Quote, type QuoteStatus } from '@/lib/data';
import { Input } from '@/components/ui/input';

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


export default function AdminQuotesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Quote Requests</CardTitle>
                <CardDescription>
                Review and manage all custom order quote requests.
                </CardDescription>
            </div>
            <Input placeholder="Filter by customer or ID..." className="max-w-sm" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
                <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>{quote.customerName}</TableCell>
                    <TableCell>{quote.date}</TableCell>
                    <TableCell>
                        <Badge variant={getBadgeVariant(quote.status)}>
                            {quote.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{quote.itemCount}</TableCell>
                    <TableCell className="text-right">
                        {quote.total ? `₦${quote.total.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/quotes/${quote.id}`}>
                                        {quote.status === 'Pending Review' || quote.status === 'Awaiting Revision' ? 'Review & Price' : 'View Details'}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
