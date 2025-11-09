
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Plus, Heart } from 'lucide-react';
import type { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useUser();
  const router = useRouter();

  const inWishlist = isWishlisted(product.id);
  
  const { lowestPrice, totalStock } = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return { lowestPrice: 0, totalStock: 0 };
    }
    const lowest = Math.min(...product.variants.map(v => v.price));
    const stock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    return { lowestPrice: lowest, totalStock: stock };
  }, [product.variants]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/shop/' + product.id);
      return;
    }
    // For card, add the first variant by default
    const defaultVariant = product.variants[0];
    if (defaultVariant) {
        addToCart(product.id, 1, defaultVariant.name);
    }
  };
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!user) {
          router.push('/login?redirect=/shop/' + product.id);
          return;
      }
      toggleWishlist(product.id);
  }

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <CardHeader className="p-0">
        <Link href={`/shop/${product.id}`} className="block relative aspect-[4/3] overflow-hidden">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          )}
          {totalStock === 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2 z-10">Out of Stock</Badge>
          )}
          <Button variant="ghost" size="icon" onClick={handleWishlistToggle} className="absolute top-2 right-2 z-10 bg-background/70 hover:bg-background rounded-full">
              <Heart className={cn("h-5 w-5 text-foreground/70", inWishlist && "fill-destructive text-destructive")} />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        <CardTitle className="text-lg mb-2">
            <Link href={`/shop/${product.id}`} className="hover:text-primary transition-colors">{product.name}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground flex-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
            </div>
            <p className="text-lg font-semibold">
              {product.variants.length > 1 ? 'From ' : ''}₦{lowestPrice.toFixed(2)}
            </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" disabled={totalStock === 0}>
            <Link href={`/shop/${product.id}`}>
              <Plus className="mr-2 h-4 w-4" /> 
              {product.variants.length > 1 ? 'Select Option' : 'Add to Cart'}
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

    