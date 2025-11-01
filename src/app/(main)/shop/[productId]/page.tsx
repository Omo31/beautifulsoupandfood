
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, Plus, Minus, ShieldCheck, Truck, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params;
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === productId);
  const image = product ? PlaceHolderImages.find(p => p.id === product.imageId) : null;
  
  const relatedProducts = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  if (!product) {
    return <div className="text-center">Product not found</div>;
  }

  const handleQuantityChange = (change: 'increase' | 'decrease') => {
    if (change === 'increase') {
      setQuantity(q => q + 1);
    } else {
      setQuantity(q => Math.max(1, q - 1));
    }
  };

  return (
    <div className="space-y-12">
      <Card>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="md:p-4">
            <div className="relative aspect-square rounded-lg overflow-hidden border">
              {image && (
                <Image
                  src={image.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  data-ai-hint={image.imageHint}
                />
              )}
            </div>
          </div>
          <div className="p-6 pt-0 md:pt-6 flex flex-col">
            <h1 className="text-3xl font-bold font-headline">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                    <span className="font-medium">{product.rating}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">{product.reviewCount} Reviews</span>
            </div>
            <p className="mt-4 text-muted-foreground flex-1">{product.description}</p>
            
            <p className="text-4xl font-bold mt-4">₦{product.price.toFixed(2)}</p>

            <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2 border rounded-md p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1}><Minus className="h-4 w-4"/></Button>
                    <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange('increase')}><Plus className="h-4 w-4"/></Button>
                </div>
                <Button size="lg" className="flex-1" disabled={product.stock === 0}>
                    <Plus className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
            </div>
             {product.stock <= 20 && product.stock > 0 && <p className="text-yellow-600 text-sm mt-2">Low stock! Only {product.stock} left.</p>}
             {product.stock === 0 && <p className="text-destructive text-sm mt-2">This product is out of stock.</p>}

            <Separator className="my-6" />

            <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary"/>
                    <span><strong>Quality Assured:</strong> Fresh and authentic ingredients guaranteed.</span>
                </div>
                 <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary"/>
                    <span><strong>Fast Delivery:</strong> Get your order delivered to your doorstep.</span>
                </div>
                 <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-primary"/>
                    <span><strong>Need Help?</strong> <a href="#" className="underline text-primary">Chat with us</a> for any questions.</span>
                </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Reviews Section */}
      <section>
        <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                        <AvatarImage src="https://picsum.photos/seed/rev1/40/40" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base">Chiamaka Nwosu</CardTitle>
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground italic">"The {product.name} was absolutely divine! It tasted just like home. I'll definitely be ordering again."</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                        <AvatarImage src="https://picsum.photos/seed/rev2/40/40" />
                        <AvatarFallback>BO</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base">Bayo Ojo</CardTitle>
                         <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground italic">"I tried the {product.name} and was blown away. So rich and flavorful. Quick delivery too!"</p>
                </CardContent>
            </Card>
        </div>
      </section>

      {/* Related Products */}
      <section>
        <h2 className="text-2xl font-bold font-headline mb-6">Related Products</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
