
'use client';

import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { PackageX } from 'lucide-react';
import Link from 'next/link';

export default function ProductUnavailablePage() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const { products } = useProducts();

    const relatedProducts = products
        .filter(p => p.category === category)
        .slice(0, 4);

    return (
        <div className="flex flex-col items-center justify-center text-center py-12">
            <PackageX className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold font-headline">Product Unavailable</h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-md">
                Sorry, the product you are looking for is no longer available or may have been removed.
            </p>
            <Button asChild className="mt-6">
                <Link href="/shop">Continue Shopping</Link>
            </Button>

            {relatedProducts.length > 0 && (
                <div className="mt-16 w-full max-w-5xl">
                    <h2 className="text-2xl font-bold font-headline mb-6">You Might Also Like</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {relatedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
