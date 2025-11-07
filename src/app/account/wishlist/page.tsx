
'use client';

import { ProductCard } from "@/components/ProductCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from 'lucide-react';
import { useWishlist } from "@/hooks/use-wishlist";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
    const { wishlistItems, loading } = useWishlist();

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Products you've saved for later.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                             <Card key={i}>
                                <Skeleton className="aspect-[4/3]" />
                                <CardContent className="p-4 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                   <Skeleton className="h-10 w-full" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {wishlistItems.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-4">
                        <Heart className="h-12 w-12" />
                        <h3 className="text-lg font-semibold">Your Wishlist is Empty</h3>
                        <p className="max-w-xs">Looks like you haven't added anything yet. Click the heart icon on a product to save it here!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
