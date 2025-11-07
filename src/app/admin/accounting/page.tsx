
'use client';

import { useState, useMemo, type FormEvent } from 'react';
import { transactions as initialTransactions, type Transaction } from '@/lib/data';
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
import { Button } from '@/components/ui/button';
import {
  File,
  PlusCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AccountingPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<string>('');

  const { totalRevenue, totalExpenses, netIncome } = useMemo(() => {
    const revenue = transactions
      .filter((t) => t.type === 'Sale')
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netIncome: revenue - expenses,
    };
  }, [transactions]);

  const handleAddExpense = (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newTransaction: Transaction = {
        id: `TRN-${Date.now().toString().slice(-4)}`,
        date: format(date || new Date(), 'yyyy-MM-dd'),
        description: formData.get('description') as string,
        category: category as Transaction['category'],
        type: 'Expense',
        amount: parseFloat(formData.get('amount') as string)
    };
    
    setTransactions([newTransaction, ...transactions]);
    toast({
        title: "Expense Added",
        description: `${newTransaction.description} has been successfully recorded.`
    });
    setAddTransactionOpen(false);
    form.reset();
    setDate(new Date());
    setCategory('');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Accounting</h1>
        <p className="text-muted-foreground">Track your income and expenses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CardDescription>Gross income from all sales.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CardDescription>Total costs from business operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -₦{totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <CardDescription>Your final profit after expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{netIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction Log</CardTitle>
              <CardDescription>A list of all financial activities.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span>Export Report</span>
                </Button>
                <Dialog open={isAddTransactionOpen} onOpenChange={setAddTransactionOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span>Add Transaction</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleAddExpense}>
                            <DialogHeader>
                                <DialogTitle>Add New Expense</DialogTitle>
                                <DialogDescription>
                                    Manually record a new business expense.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant={"outline"}
                                            className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                                            >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input id="description" name="description" placeholder="e.g., Packaging supplies" required/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount (₦)</Label>
                                    <Input id="amount" name="amount" type="number" placeholder="0.00" required/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select name="category" onValueChange={setCategory} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Supplies">Supplies</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="Salaries">Salaries</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAddTransactionOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Expense</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      t.type === 'Sale' ? 'text-green-600' : 'text-destructive'
                    )}
                  >
                    {t.type === 'Sale' ? '' : '-'}₦{t.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
