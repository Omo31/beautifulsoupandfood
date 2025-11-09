
'use client';

import { useState, useMemo, type FormEvent } from 'react';
import {
  File,
  ListFilter,
  PlusCircle,
  MoreHorizontal,
  Search,
  Sparkles,
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import type { Product, ProductVariant } from '@/lib/data';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { convertToCSV, downloadCSV } from '@/lib/csv';

const StockBadge = ({ stock }: { stock: number }) => {
  const threshold = 20; // Example threshold
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= threshold) {
    return <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80">Low Stock</Badge>;
  }
  return <Badge variant="default">In Stock</Badge>;
};

const ITEMS_PER_PAGE = 10;

export default function InventoryPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { products, loading } = useProducts();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => {
        const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
        if (statusFilter === 'all') return true;
        if (statusFilter === 'in-stock') return totalStock > 20;
        if (statusFilter === 'low-stock') return totalStock > 0 && totalStock <= 20;
        if (statusFilter === 'out-of-stock') return totalStock === 0;
        return true;
      })
      .filter(p => categoryFilter === 'all' || p.category === categoryFilter);
  }, [products, searchTerm, statusFilter, categoryFilter]);

  const paginatedProducts = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setDescription(product?.description || '');
    setImageUrl(product?.imageUrl || '');
    setVariants(product?.variants ? JSON.parse(JSON.stringify(product.variants)) : [{ name: '', price: 0, stock: 0 }]);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setDescription('');
    setImageUrl('');
    setVariants([]);
  }

  const handleSaveProduct = async (formData: FormData) => {
      if (!firestore) return;

      const productData = {
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          category: formData.get('category') as 'foodstuff' | 'soup',
          imageUrl: imageUrl,
          variants: variants,
          // These are not editable in the form but need to be preserved
          rating: editingProduct?.rating || 0,
          reviewCount: editingProduct?.reviewCount || 0,
      };

      try {
        if (editingProduct) {
            const productRef = doc(firestore, 'products', editingProduct.id);
            await setDoc(productRef, productData, { merge: true });
            toast({ title: "Product Updated", description: `${productData.name} has been successfully updated.`});
        } else {
            const productsCollection = collection(firestore, 'products');
            await addDoc(productsCollection, productData);
            toast({ title: "Product Added", description: `${productData.name} has been successfully added.`});
        }
        handleCloseModal();
      } catch (error) {
        console.error("Error saving product: ", error);
        toast({ variant: 'destructive', title: "Save failed", description: "Could not save the product."});
      }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, 'products', productId));
        toast({ variant: 'destructive', title: "Product Deleted", description: "The product has been removed from inventory."});
    } catch (error) {
        console.error("Error deleting product: ", error);
        toast({ variant: 'destructive', title: "Delete failed", description: "Could not delete the product."});
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleGenerateDescription = async (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const keywords = `${formData.get('name')}, ${formData.get('category')}`;

    if (!keywords.trim() || keywords.trim() === ',') {
      toast({ variant: 'destructive', title: 'Keywords needed', description: 'Please enter a name and category first.' });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductDescription({ keywords });
      setDescription(result);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Generation failed', description: 'Could not generate a description.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredProducts.map(p => ({
        ID: p.id,
        Name: p.name,
        Category: p.category,
        Description: p.description,
        Rating: p.rating,
        ReviewCount: p.reviewCount,
        Variants: JSON.stringify(p.variants),
        TotalStock: p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0,
        LowestPrice: p.variants?.length > 0 ? Math.min(...p.variants.map(v => v.price)) : 0,
    }));

    const csv = convertToCSV(dataToExport);
    downloadCSV(csv, `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <>
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-headline">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and stock levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={handleExport}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" className="gap-1" onClick={() => handleOpenModal()}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Product
            </span>
          </Button>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Filter by product name..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                            <ListFilter className="h-3.5 w-3.5"/>
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked={statusFilter === 'all'} onCheckedChange={() => setStatusFilter('all')}>All</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={statusFilter === 'in-stock'} onCheckedChange={() => setStatusFilter('in-stock')}>In Stock</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={statusFilter === 'low-stock'} onCheckedChange={() => setStatusFilter('low-stock')}>Low Stock</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={statusFilter === 'out-of-stock'} onCheckedChange={() => setStatusFilter('out-of-stock')}>Out of Stock</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="foodstuff">Foodstuff</SelectItem>
                        <SelectItem value="soup">Soup</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Loading inventory...</TableCell></TableRow>
              ) : paginatedProducts.map((product) => {
                const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                const priceRange = product.variants?.length > 0 
                  ? product.variants.length > 1
                    ? `₦${Math.min(...product.variants.map(v => v.price))} - ₦${Math.max(...product.variants.map(v => v.price))}`
                    : `₦${product.variants[0].price}`
                  : 'N/A';
                  
                return (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        {product.imageUrl ? (
                           <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : <div className="h-16 w-16 bg-muted rounded-md" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <StockBadge stock={totalStock} />
                    </TableCell>
                    <TableCell>{priceRange}</TableCell>
                    <TableCell>{totalStock}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenModal(product)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProduct(product.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
           <div className="text-xs text-muted-foreground">
            Showing <strong>{paginatedProducts.length}</strong> of <strong>{filteredProducts.length}</strong> products
          </div>
          <Pagination className="ml-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => {e.preventDefault(); handlePageChange(Math.max(1, currentPage - 1))}} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                    <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => {e.preventDefault(); handlePageChange(i + 1)}}>{i + 1}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => {e.preventDefault(); handlePageChange(Math.min(totalPages, currentPage + 1))}} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}/>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
      
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-2xl">
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); handleSaveProduct(new FormData(e.currentTarget)); }}>
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>
                      {editingProduct ? 'Update the details for this product.' : 'Fill in the details to add a new product to your inventory.'}
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh] -mx-6 px-6 py-4">
                    <div className="grid gap-4 pr-1">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" placeholder="Product Name" className="col-span-3" defaultValue={editingProduct?.name} required/>
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">Description</Label>
                        <div className="col-span-3 space-y-2">
                           <Textarea id="description" name="description" placeholder="A short description..." value={description} onChange={(e) => setDescription(e.target.value)} required/>
                           <Button type="button" variant="outline" size="sm" onClick={(e) => handleGenerateDescription(e.currentTarget.form!)} disabled={isGenerating}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                          </Button>
                        </div>
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Select name="category" defaultValue={editingProduct?.category} required>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="foodstuff">Foodstuff</SelectItem>
                                <SelectItem value="soup">Soup</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image-url" className="text-right">Image URL</Label>
                        <Input id="image-url" name="image-url" className="col-span-3" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Variants</Label>
                        <div className="col-span-3 space-y-2">
                          {variants.map((variant, index) => (
                            <div key={index} className="flex items-end gap-2">
                              <div className="grid gap-1.5 flex-1">
                                <Label htmlFor={`variant-name-${index}`}>Name</Label>
                                <Input id={`variant-name-${index}`} value={variant.name} onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[index].name = e.target.value;
                                  setVariants(newVariants);
                                }} placeholder="e.g., Small Bowl"/>
                              </div>
                              <div className="grid gap-1.5 w-24">
                                <Label htmlFor={`variant-price-${index}`}>Price</Label>
                                <Input id={`variant-price-${index}`} type="number" value={variant.price} onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[index].price = parseFloat(e.target.value);
                                  setVariants(newVariants);
                                }} placeholder="0"/>
                              </div>
                              <div className="grid gap-1.5 w-20">
                                <Label htmlFor={`variant-stock-${index}`}>Stock</Label>
                                <Input id={`variant-stock-${index}`} type="number" value={variant.stock} onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[index].stock = parseInt(e.target.value, 10);
                                  setVariants(newVariants);
                                }} placeholder="0"/>
                              </div>
                               <Button type="button" variant="ghost" size="icon" onClick={() => setVariants(variants.filter((_, i) => i !== index))} disabled={variants.length === 1}>
                                <PlusCircle className="h-4 w-4 rotate-45" />
                              </Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { name: '', price: 0, stock: 0 }])}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Variant
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                    <Button type="submit">Save Product</Button>
                  </DialogFooter>
              </form>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
