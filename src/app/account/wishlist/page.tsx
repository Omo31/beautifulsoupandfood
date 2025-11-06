'use client';

import { useState } from 'react';
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from 'lucide-react';

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState(() => products.slice(3, 6)); // Mock wishlist items

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Products you've saved for later.</CardDescription>
            </CardHeader>
            <CardContent>
                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {wishlistItems.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-4">
                        <Heart className="h-12 w-12" />
                        <h3 className="text-lg font-semibold">Your Wishlist is Empty</h3>
                        <p className="max-w-xs">Looks like you haven't added anything yet. Start exploring and save your favorites!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
