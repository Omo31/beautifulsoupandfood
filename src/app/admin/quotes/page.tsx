
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
import { type QuoteStatus, type QuoteRequest } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/utils';

const getBadgeVariant = (status: QuoteStatus) => {
    switch (status) {
        case 'Quote Ready': return 'default';
        case 'Accepted': case 'Paid': return 'outline';
        case 'Expired':
        case 'Rejected': 
            return 'destructive';
        case 'Pending Review':
        default:
            return 'secondary';
    }
}


export default function AdminQuotesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const quotesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'quotes'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: quotes, loading } = useCollection<QuoteRequest>(quotesQuery);
  
  const calculateTotal = (quote: QuoteRequest) => {
    if (quote.status === 'Quote Ready' || quote.status === 'Accepted' || quote.status === 'Paid') {
      // @ts-ignore
      const itemsTotal = quote.items.reduce((acc, item) => acc + ((item.unitCost || 0) * item.quantity), 0);
      const serviceCharge = itemsTotal * 0.06;
      // @ts-ignore
      const shipping = quote.shippingCost || 0;
      return itemsTotal + serviceCharge + shipping;
    }
    return null;
  }

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
             {loading ? (
                [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                    </TableRow>
                ))
            ) : quotes.map((quote) => {
                const total = calculateTotal(quote);
                return (
                    <TableRow key={quote.id}>
                        <TableCell className="font-medium">#{quote.id?.substring(0, 6)}</TableCell>
                        <TableCell>{quote.name}</TableCell>
                        <TableCell>{format(quote.createdAt.toDate(), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                            <Badge variant={getBadgeVariant(quote.status)}>
                                {quote.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{quote.items.length}</TableCell>
                        <TableCell className="text-right">
                            {total ? `₦${total.toFixed(2)}` : 'N/A'}
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
                                            {quote.status === 'Pending Review' ? 'Review & Price' : 'View Details'}
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
