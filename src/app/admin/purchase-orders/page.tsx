
'use client';

import { useState, useMemo, type FormEvent } from 'react';
import type { PurchaseOrderItem, PurchaseOrder } from '@/lib/data';
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { collection, addDoc, doc, setDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';


const StatusBadge = ({ status }: { status: PurchaseOrder['status'] }) => {
  const variants = {
    Draft: 'outline',
    Pending: 'secondary',
    Completed: 'default',
    Cancelled: 'destructive',
  } as const;
  return <Badge variant={variants[status]}>{status}</Badge>;
};

type NewPOItem = {
    productName: string;
    productId: string;
    quantity: number;
    cost: number;
};

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const posQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'purchaseOrders');
  }, [firestore]);

  const { data: purchaseOrders, loading } = useCollection<PurchaseOrder>(posQuery);

  const [isNewPOOpen, setNewPOOpen] = useState(false);
  const [newPOItems, setNewPOItems] = useState<Partial<NewPOItem>[]>([{}]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleAddItem = () => {
    setNewPOItems([...newPOItems, {}]);
  };

  const handleRemoveItem = (index: number) => {
    setNewPOItems(newPOItems.filter((_, i) => i !== index));
  };
  
  const handleItemChange = (index: number, field: keyof NewPOItem, value: string | number) => {
      const updatedItems = [...newPOItems];
      const item = updatedItems[index] as NewPOItem;
      (item[field] as any) = value;
      setNewPOItems(updatedItems);
  };
  
  const totalCost = useMemo(() => {
    return newPOItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.cost || 0), 0);
  }, [newPOItems]);
  
  const handleSavePO = async (e: FormEvent, status: PurchaseOrder['status']) => {
      e.preventDefault();
      if (!firestore) return;

      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      
      const newPOData = {
          supplier: formData.get('supplier') as string,
          date: Timestamp.fromDate(date || new Date()),
          status: status,
          total: totalCost,
      };

      try {
        const poCollection = collection(firestore, 'purchaseOrders');
        const newPoRef = doc(poCollection);
        
        const batch = writeBatch(firestore);
        batch.set(newPoRef, newPOData);
        
        const itemsCollection = collection(newPoRef, 'items');
        newPOItems.forEach((item, index) => {
            const itemRef = doc(itemsCollection);
            const lineItem = {
                productName: formData.get(`item-name-${index}`) as string,
                productId: formData.get(`item-id-${index}`) as string,
                quantity: parseInt(formData.get(`item-qty-${index}`) as string, 10),
                cost: parseFloat(formData.get(`item-cost-${index}`) as string),
            };
            batch.set(itemRef, lineItem);
        });

        await batch.commit();

        toast({
            title: `Purchase Order ${status}`,
            description: `PO has been saved as ${status}.`
        });
        
        setNewPOOpen(false);
        setNewPOItems([{}]);
      } catch (error) {
        console.error("Error saving PO:", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the purchase order.' });
      }
  };
  
  const handleStatusChange = async (po: PurchaseOrder, newStatus: PurchaseOrder['status']) => {
      if (!firestore) return;
      
      const poRef = doc(firestore, 'purchaseOrders', po.id);
      
      try {
          const batch = writeBatch(firestore);
          batch.update(poRef, { status: newStatus });

          // If marking as completed, create an expense transaction
          if (newStatus === 'Completed') {
              const transactionRef = doc(collection(firestore, 'transactions'));
              const transactionData = {
                  date: Timestamp.now(),
                  description: `PO from ${po.supplier} - #${po.id.substring(0,6)}`,
                  category: 'Supplies',
                  type: 'Expense',
                  amount: po.total,
              };
              batch.set(transactionRef, transactionData);
          }
          
          await batch.commit();

          toast({
              title: 'Status Updated',
              description: `PO #${po.id.substring(0,6)} has been marked as ${newStatus}.`
          });
      } catch (error) {
          console.error("Error updating PO status:", error);
          toast({ variant: 'destructive', title: 'Update Failed'});
      }
  }

  const renderTableBody = () => {
    if (loading) {
        return [...Array(5)].map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
            </TableRow>
        ))
    }
    if (purchaseOrders.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No purchase orders created yet.
                </TableCell>
            </TableRow>
        )
    }

    const sortedPOs = [...purchaseOrders].sort((a,b) => b.date.toDate().getTime() - a.date.toDate().getTime());

    return sortedPOs.map((po) => (
        <TableRow key={po.id}>
            <TableCell className="font-medium">#{po.id.substring(0,6)}</TableCell>
            <TableCell>{po.supplier}</TableCell>
            <TableCell>{format(po.date.toDate(), 'yyyy-MM-dd')}</TableCell>
            <TableCell>
            <StatusBadge status={po.status} />
            </TableCell>
            <TableCell className="text-right">₦{po.total.toFixed(2)}</TableCell>
            <TableCell className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View Details</DropdownMenuItem>
                {po.status === 'Draft' && <DropdownMenuItem>Edit</DropdownMenuItem>}
                {po.status === 'Pending' && <DropdownMenuItem onClick={() => handleStatusChange(po, 'Completed')}>Mark as Completed</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(po, 'Cancelled')}>
                    Cancel PO
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </TableCell>
        </TableRow>
    ))
  }

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-headline">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage and track orders with your suppliers.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={isNewPOOpen} onOpenChange={setNewPOOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        New Purchase Order
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <form>
                        <DialogHeader>
                            <DialogTitle>Create New Purchase Order</DialogTitle>
                            <DialogDescription>
                            Fill out the details to create a new order for your suppliers.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="supplier">Supplier Name</Label>
                                    <Input id="supplier" name="supplier" placeholder="e.g., Global Food Imports" required/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Order Date</Label>
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
                            </div>

                            <div className="space-y-4">
                                <Label className="font-medium">Line Items</Label>
                                {newPOItems.map((item, index) => (
                                    <Card key={index} className="p-4 bg-muted/50">
                                        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-end">
                                            <div className="grid gap-1">
                                                <Label htmlFor={`item-name-${index}`}>Product Name</Label>
                                                <Input id={`item-name-${index}`} name={`item-name-${index}`} placeholder="e.g., Pounded Yam Flour" required onChange={e => handleItemChange(index, 'productName', e.target.value)}/>
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor={`item-id-${index}`}>Product ID</Label>
                                                <Input id={`item-id-${index}`} name={`item-id-${index}`} placeholder="e.g., PYF-001" onChange={e => handleItemChange(index, 'productId', e.target.value)}/>
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                                                <Input id={`item-qty-${index}`} name={`item-qty-${index}`} type="number" placeholder="0" className="w-20" required onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))}/>
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor={`item-cost-${index}`}>Cost/Unit (₦)</Label>
                                                <Input id={`item-cost-${index}`} name={`item-cost-${index}`} type="number" placeholder="0.00" className="w-24" required onChange={e => handleItemChange(index, 'cost', parseFloat(e.target.value))}/>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} disabled={newPOItems.length === 1} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
                                </Button>
                            </div>
                            <div className="text-right font-bold text-lg">
                            Total Cost: ₦{totalCost.toFixed(2)}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setNewPOOpen(false)}>Cancel</Button>
                            <Button type="submit" onClick={(e) => handleSavePO(e, 'Draft')}>Save as Draft</Button>
                            <Button type="submit" onClick={(e) => handleSavePO(e, 'Pending')}>Create PO</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input placeholder="Filter by supplier..." className="max-w-xs" />
            <div className="ml-auto flex items-center gap-2">
                <Select>
                    <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                            <CalendarIcon className="h-3.5 w-3.5"/>
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Date Range</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                       <Calendar mode="range" numberOfMonths={2} />
                    </PopoverContent>
                </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{purchaseOrders.length}</strong> of <strong>{purchaseOrders.length}</strong> purchase orders
          </div>
           <Pagination className="ml-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}
