import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { products, testimonials } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
        <div className="relative h-[60vh] min-h-[400px] w-full">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
            Authentic Nigerian Flavors, Delivered.
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200 drop-shadow-md">
            From our kitchen to yours, experience the rich taste of Nigeria with our fresh ingredients and ready-to-eat soups.
          </p>
          <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/shop">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-3xl font-bold font-headline text-center">Featured Products</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
            <Button variant="outline" asChild>
                <Link href="/shop">View All Products</Link>
            </Button>
        </div>
      </section>

      {/* About Us */}
      <section className="bg-card p-8 rounded-lg">
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
                 <h2 className="text-3xl font-bold font-headline">About BeautifulSoup&Food</h2>
                 <p className="mt-4 text-muted-foreground">
                    Founded with a passion for preserving the authentic tastes of Nigerian cuisine, BeautifulSoup&Food is your trusted source for high-quality, fresh foodstuffs and lovingly prepared traditional soups. We bridge the distance, bringing the vibrant flavors of home to your doorstep, no matter where you are.
                 </p>
                 <p className="mt-4 text-muted-foreground">
                    Our commitment is to quality, freshness, and customer satisfaction. We meticulously source our ingredients and prepare our meals with the same care and attention you would find in a Nigerian family kitchen.
                 </p>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
                <Image src="https://picsum.photos/seed/about/600/400" alt="Nigerian market stall" fill className="object-cover" data-ai-hint="nigerian market"/>
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <h2 className="text-3xl font-bold font-headline text-center">What Our Customers Say</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => {
            const image = PlaceHolderImages.find(i => i.id === testimonial.imageId);
            return (
              <Card key={testimonial.id} className="text-center">
                <CardHeader>
                    {image && <Image src={image.imageUrl} alt={testimonial.name} width={80} height={80} className="mx-auto rounded-full" data-ai-hint={image.imageHint}/>}
                    <CardTitle className="mt-4">{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
