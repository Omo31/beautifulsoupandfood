import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function SoupPage() {
    const soupProducts = products.filter(p => p.category === 'soup');
    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline">Our Delicious Soups</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Authentically prepared, bursting with flavor, and ready to enjoy. Discover your favorite Nigerian soup.
                </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {soupProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <Separator className="my-12" />

            <section>
                <h2 className="text-3xl font-bold font-headline mb-8 text-center">Customer Reviews</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/rev1/40/40" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>Chiamaka Nwosu</CardTitle>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground italic">"The Egusi soup was absolutely divine! It tasted just like home. I'll definitely be ordering again."</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/rev2/40/40" />
                                    <AvatarFallback>BO</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>Bayo Ojo</CardTitle>
                                    <div className="flex items-center gap-0.5">
                                         {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground italic">"I tried the Banga soup and was blown away. So rich and flavorful. Quick delivery too!"</p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
