

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, PackageSearch, Gift, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { homepageServices as defaultHomepageServices, HomepageService, Testimonial } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/use-products';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { collection, query, orderBy } from 'firebase/firestore';
import { useSettings } from '@/hooks/use-settings';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<HomepageService['iconName'], React.ElementType> = {
  PackageSearch,
  Gift,
  Boxes,
};

export default function HomePage() {
  const { products } = useProducts();
  const firestore = useFirestore();
  const { settings } = useSettings();

  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonials'), orderBy('name'));
  }, [firestore]);

  const { data: testimonials, loading: testimonialsLoading } = useCollection<Testimonial>(testimonialsQuery);

  const heroImageId = settings?.homepage?.heroImageId || "hero";
  const heroImage = PlaceHolderImages.find((img) => img.id === heroImageId);
  const featuredProducts = products.slice(0, 4);

  const heroTitle = settings?.homepage?.heroTitle || "Authentic Nigerian Flavors, Delivered.";
  const heroSubtitle = settings?.homepage?.heroSubtitle || "From our kitchen to yours, experience the rich taste of Nigeria with our fresh ingredients and ready-to-eat soups.";
  const videoId = settings?.homepage?.videoId || "dQw4w9WgXcQ";
  const videoTitle = settings?.homepage?.videoTitle || "Our Story";
  const videoDescription = settings?.homepage?.videoDescription || "Watch how we source the freshest ingredients and prepare them with love, bringing the taste of Nigeria to your kitchen. From the local market to your dinner table, our commitment to quality and tradition is in every meal.";
  const homepageServices = defaultHomepageServices; // Not dynamic in this version

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
            {heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200 drop-shadow-md">
            {heroSubtitle}
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

      {/* Our Services Section */}
      <section>
        <div className="text-center">
          <h2 className="text-3xl font-bold font-headline">Our Services</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            We offer more than just products. Let us know how we can serve you better.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {homepageServices.map(service => {
            const Icon = iconMap[service.iconName];
            return (
              <Card key={service.id} className="text-center">
                <CardHeader className="items-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="text-center mt-8">
            <Button asChild>
                <Link href="/custom-order">Request a Custom Order</Link>
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
          {testimonialsLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent>
                <CardHeader className="flex-row items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            testimonials.map(testimonial => {
              const image = PlaceHolderImages.find(p => p.id === testimonial.imageId);
              return (
                <Card key={testimonial.id} className="flex flex-col">
                  <CardContent className="pt-6 flex-1">
                    <p className="italic text-muted-foreground">"{testimonial.comment}"</p>
                  </CardContent>
                  <CardHeader className="flex-row items-center gap-4">
                     <Avatar>
                      {image && <AvatarImage src={image.imageUrl} alt={testimonial.name} />}
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </CardHeader>
                </Card>
              )
            })
          )}
        </div>
      </section>

      {/* Featured Video */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold font-headline">{videoTitle}</h2>
            <p className="mt-2 text-muted-foreground">
              {videoDescription}
            </p>
          </div>
          <div className="aspect-video w-full rounded-lg overflow-hidden border shadow-lg">
              <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
              ></iframe>
          </div>
      </section>

    </div>
  );
}
