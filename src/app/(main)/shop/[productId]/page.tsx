
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, Plus, Minus, ShieldCheck, Truck, MessageSquare, Heart } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProductCard } from '@/components/ProductCard';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { collection, doc, addDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/utils';
import type { Review } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ProductDetailPage() {
  const { products, findById } = useProducts();
  const params = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { productId } = params;
  const [quantity, setQuantity] = useState(1);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  
  const { addToCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const product = findById(productId as string);
  const image = product ? PlaceHolderImages.find(p => p.id === product.imageId) : null;
  
  const reviewsQuery = useMemoFirebase(() => {
      if (!firestore || !productId) return null;
      return collection(firestore, `products/${productId}/reviews`);
  }, [firestore, productId]);

  const { data: reviews, loading: reviewsLoading, error: reviewsError } = useCollection<Review>(reviewsQuery);
  
  const relatedProducts = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  if (!product) {
    return <div className="text-center">Product not found</div>;
  }
  
  const inWishlist = isWishlisted(product.id);

  const handleQuantityChange = (change: 'increase' | 'decrease') => {
    if (change === 'increase') {
      setQuantity(q => q + 1);
    } else {
      setQuantity(q => Math.max(1, q - 1));
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login?redirect=/shop/' + product.id);
      return;
    }
    addToCart(product.id, quantity);
  };
  
  const handleWishlistToggle = () => {
      if (!user) {
          router.push('/login?redirect=/shop/' + product.id);
          return;
      }
      toggleWishlist(product.id);
  }


  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !product) {
        toast({ variant: 'destructive', title: 'You must be logged in to leave a review.' });
        return;
    }
    if (newReviewRating === 0 || !newReviewText.trim()) {
        toast({
            variant: 'destructive',
            title: 'Incomplete Review',
            description: 'Please provide a rating and a comment.',
        });
        return;
    }

    const reviewData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        rating: newReviewRating,
        comment: newReviewText,
        createdAt: serverTimestamp(),
    };
    
    const productRef = doc(firestore, 'products', product.id);
    const reviewsRef = collection(productRef, 'reviews');

    runTransaction(firestore, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
            throw "Product does not exist!";
        }

        transaction.set(doc(reviewsRef), reviewData);

        const currentRating = productDoc.data().rating || 0;
        const currentReviewCount = productDoc.data().reviewCount || 0;
        const newReviewCount = currentReviewCount + 1;
        const newTotalRating = (currentRating * currentReviewCount) + newReviewRating;
        const newAverageRating = newTotalRating / newReviewCount;
        
        transaction.update(productRef, {
            rating: newAverageRating,
            reviewCount: newReviewCount
        });
    }).then(() => {
        toast({
            title: 'Review Submitted!',
            description: 'Thank you for your feedback.',
        });
        setNewReviewRating(0);
        setNewReviewText('');
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: reviewsRef.path,
            operation: 'create',
            requestResourceData: reviewData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

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
                    <span className="font-medium">{product.rating.toFixed(1)}</span>
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
                <Button size="lg" className="flex-1" disabled={product.stock === 0} onClick={handleAddToCart}>
                    <Plus className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
                <Button variant="outline" size="icon" onClick={handleWishlistToggle} aria-label="Add to wishlist">
                  <Heart className={cn("h-5 w-5", inWishlist && "fill-destructive text-destructive")} />
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
        <div className="space-y-6">
            {reviewsLoading ? (
                <p>Loading reviews...</p>
            ) : reviews.length > 0 ? (
                reviews.map(review => (
                    <Card key={review.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar>
                                {review.userAvatar ? <AvatarImage src={review.userAvatar} /> : <AvatarImage src="https://picsum.photos/seed/avatar/40/40" />}
                                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-base">{review.userName}</CardTitle>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                                </div>
                            </div>
                            <span className="text-sm text-muted-foreground ml-auto">{formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true })}</span>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground italic">"{review.comment}"</p>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <p className="text-muted-foreground text-center">No reviews for this product yet. Be the first!</p>
            )}
        </div>

        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>Share your thoughts about this product with other customers.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleReviewSubmit}>
                    <div>
                        <Label className="font-medium mb-2 flex">Your Rating</Label>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-6 w-6 cursor-pointer ${i < newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    onClick={() => setNewReviewRating(i + 1)}
                                />
                            ))}
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="review-text">Your Review</Label>
                        <Textarea id="review-text" placeholder="What did you like or dislike?" value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} required/>
                    </div>
                    <Button type="submit">Submit Review</Button>
                </form>
            </CardContent>
        </Card>
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
