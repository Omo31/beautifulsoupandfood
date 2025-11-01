'use client';

import { useState } from 'react';
import {
  File,
  ListFilter,
  PlusCircle,
  MoreHorizontal,
  Upload,
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
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { products as initialProducts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';

const StockBadge = ({ stock, threshold = 20 }: { stock: number, threshold?: number }) => {
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= threshold) {
    return <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80">Low Stock</Badge>;
  }
  return <Badge variant="default">In Stock</Badge>;
};

export default function InventoryPage() {
  const [products, setProducts] = useState(initialProducts);
  const [isAddProductOpen, setAddProductOpen] = useState(false);

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
          <Button variant="outline" size="sm" className="gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Dialog open={isAddProductOpen} onOpenChange={setAddProductOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new product to your inventory.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-6">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" placeholder="Product Name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea id="description" placeholder="A short description..." className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 items-center gap-x-4 gap-y-2">
                          <Label htmlFor="price" className="text-right">Price (₦)</Label>
                          <Input id="price" type="number" placeholder="0.00" />
                      </div>
                      <div className="grid grid-cols-2 items-center gap-x-4 gap-y-2">
                          <Label htmlFor="stock" className="text-right">Stock</Label>
                          <Input id="stock" type="number" placeholder="0" />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 items-center gap-x-4 gap-y-2">
                          <Label htmlFor="category" className="text-right">Category</Label>
                          <Select>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="foodstuff">Foodstuff</SelectItem>
                                  <SelectItem value="soup">Soup</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-x-4 gap-y-2">
                          <Label htmlFor="threshold" className="text-right">Low Stock Threshold</Label>
                          <Input id="threshold" type="number" placeholder="e.g., 5" />
                      </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Image</Label>
                    <div className="col-span-3">
                      <div className="flex items-center justify-center w-full">
                          <Label
                              htmlFor="dropzone-file"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50"
                          >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                  <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
                              </div>
                              <Input id="dropzone-file" type="file" className="hidden" />
                          </Label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image-url" className="text-right">Or Image URL</Label>
                      <Input id="image-url" placeholder="https://example.com/image.png" className="col-span-3" />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddProductOpen(false)}>Cancel</Button>
                <Button type="submit">Save Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input placeholder="Filter by product name..." className="max-w-sm" />
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                            <ListFilter className="h-3.5 w-3.5"/>
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter by Status</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>In Stock</DropdownMenuItem>
                        <DropdownMenuItem>Low Stock</DropdownMenuItem>
                        <DropdownMenuItem>Out of Stock</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Select>
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
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const image = PlaceHolderImages.find((p) => p.id === product.imageId);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        {image ? (
                           <Image
                            src={image.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            data-ai-hint={image.imageHint}
                            sizes="64px"
                          />
                        ) : <div className="h-16 w-16 bg-muted rounded-md" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <StockBadge stock={product.stock} />
                    </TableCell>
                    <TableCell>₦{product.price.toFixed(2)}</TableCell>
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
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
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
            Showing <strong>1-10</strong> of <strong>{products.length}</strong> products
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
                <PaginationLink href="#" isActive>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </>
  );
}
