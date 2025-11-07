
'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ListFilter } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { SearchInput } from '@/components/SearchInput';
import { useProducts } from '@/hooks/use-products';

export default function ShopPage() {
    const { products } = useProducts();
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('q') || '';

    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, products]);


    return (
        <div className="grid md:grid-cols-[240px_1fr] gap-8">
            <aside>
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-4">Filters</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium mb-2">Category</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="foodstuff" />
                                        <Label htmlFor="foodstuff">Foodstuff</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="soups" />
                                        <Label htmlFor="soups">Soups</Label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Price Range</h4>
                                <Slider defaultValue={[0, 50000]} max={100000} step={1000} />
                                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                    <span>₦0</span>
                                    <span>₦100,000</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Stock Status</h4>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="in-stock" />
                                    <Label htmlFor="in-stock">In Stock</Label>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </aside>
            <main>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-4xl font-bold font-headline">Shop</h1>
                     <div className="flex items-center gap-2">
                        <div className="md:hidden">
                            <SearchInput placeholder="Search products..." />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1">
                                    <ListFilter className="h-4 w-4" />
                                    <span className="text-sm">Sort</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Popularity</DropdownMenuItem>
                                <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                                <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                                <DropdownMenuItem>Newest</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                {filteredProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        <Pagination className="mt-8">
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
                                    <PaginationLink href="#">3</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext href="#" />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold">No Products Found</h2>
                        <p className="text-muted-foreground mt-2">
                            Your search for "{searchTerm}" did not match any products.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
