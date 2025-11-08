
'use client';

import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SoupPage() {
    const { products, loading } = useProducts();
    const soupProducts = products.filter(p => p.category === 'soup');

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline">Our Delicious Soups</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Authentically prepared, bursting with flavor, and ready to enjoy. Discover your favorite Nigerian soup.
                </p>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <Skeleton className="aspect-[4/3]" />
                            <CardContent className="p-4">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full mb-4" />
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-5 w-1/4" />
                                    <Skeleton className="h-5 w-1/4" />
                                </div>
                            </CardContent>
                            <CardHeader className="p-4 pt-0">
                               <Skeleton className="h-10 w-full" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {soupProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}
