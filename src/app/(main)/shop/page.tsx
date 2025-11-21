
'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
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

const ITEMS_PER_PAGE = 9;

type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'newest';

export default function ShopPage() {
    const { products } = useProducts();
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('q') || '';
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState<SortOption>('popularity');

    const [filters, setFilters] = useState({
        categories: [] as string[],
        priceRange: [0, 100000] as [number, number],
        inStock: false
    });

    // Reset to first page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchTerm]);


    const handleCategoryChange = (category: string, checked: boolean | 'indeterminate') => {
        setFilters(prev => ({
            ...prev,
            categories: checked ? [...prev.categories, category] : prev.categories.filter(c => c !== category)
        }));
    };

    const handlePriceChange = (value: number[]) => {
        setFilters(prev => ({
            ...prev,
            priceRange: value as [number, number]
        }));
    };

    const handleStockChange = (checked: boolean | 'indeterminate') => {
        setFilters(prev => ({
            ...prev,
            inStock: !!checked
        }));
    };

    const filteredProducts = useMemo(() => {
        let filtered = products.filter(product => {
            const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const categoryMatch = filters.categories.length === 0 || filters.categories.includes(product.category);

            const lowestPrice = product.variants.length > 0 ? Math.min(...product.variants.map(v => v.price)) : 0;
            const priceMatch = lowestPrice >= filters.priceRange[0] && lowestPrice <= filters.priceRange[1];

            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
            const stockMatch = !filters.inStock || totalStock > 0;

            return searchMatch && categoryMatch && priceMatch && stockMatch;
        });

        // Apply sorting
        switch (sortOption) {
            case 'popularity':
                filtered.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            case 'price-asc':
                filtered.sort((a, b) => {
                    const priceA = a.variants.length > 0 ? Math.min(...a.variants.map(v => v.price)) : 0;
                    const priceB = b.variants.length > 0 ? Math.min(...b.variants.map(v => v.price)) : 0;
                    return priceA - priceB;
                });
                break;
            case 'price-desc':
                 filtered.sort((a, b) => {
                    const priceA = a.variants.length > 0 ? Math.min(...a.variants.map(v => v.price)) : 0;
                    const priceB = b.variants.length > 0 ? Math.min(...b.variants.map(v => v.price)) : 0;
                    return priceB - priceA;
                });
                break;
            case 'newest':
                // Assuming default order is newest, or sorting by name as a proxy
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }

        return filtered;
    }, [searchTerm, products, filters, sortOption]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);
    
    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };


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
                                        <Checkbox id="foodstuff" onCheckedChange={(checked) => handleCategoryChange('foodstuff', checked)} />
                                        <Label htmlFor="foodstuff">Foodstuff</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="soups" onCheckedChange={(checked) => handleCategoryChange('soup', checked)}/>
                                        <Label htmlFor="soups">Soups</Label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Price Range</h4>
                                <Slider 
                                    defaultValue={filters.priceRange} 
                                    max={100000} 
                                    step={1000}
                                    onValueChange={handlePriceChange}
                                />
                                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                    <span>₦{filters.priceRange[0]}</span>
                                    <span>₦{filters.priceRange[1]}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Stock Status</h4>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="in-stock" onCheckedChange={handleStockChange} />
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
                                <DropdownMenuItem onSelect={() => setSortOption('popularity')}>Popularity</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setSortOption('price-asc')}>Price: Low to High</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setSortOption('price-desc')}>Price: High to Low</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setSortOption('newest')}>Newest</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                {paginatedProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {paginatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <Pagination className="mt-8">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href="#" onClick={(e) => {e.preventDefault(); handlePageChange(currentPage - 1);}} className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined} />
                                    </PaginationItem>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => {e.preventDefault(); handlePageChange(i + 1);}}>
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext href="#" onClick={(e) => {e.preventDefault(); handlePageChange(currentPage + 1);}} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}/>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold">No Products Found</h2>
                        <p className="text-muted-foreground mt-2">
                            Your search for "{searchTerm}" did not match any products with the selected filters.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
