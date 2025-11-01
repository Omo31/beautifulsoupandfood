import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WishlistPage() {
    const wishlistItems = products.slice(3, 6); // Mock wishlist items

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
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Your wishlist is empty.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
