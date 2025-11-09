

'use client';

import { useState, useMemo, type FormEvent, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  PlusCircle,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { collection, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import type { Testimonial } from '@/lib/data';
import { useSettings } from '@/hooks/use-settings';
import type { LgaShippingZone } from '@/lib/shipping';
import { Skeleton } from '@/components/ui/skeleton';


const initialRoles = [
  {
    name: 'Owner',
    permissions: {}, // In this mock, empty means all permissions
  },
  {
    name: 'Content Manager',
    permissions: {
      dashboard: ['view'],
      orders: ['view', 'edit'],
      inventory: ['view', 'create', 'edit'],
      conversations: ['view', 'create'],
    },
  },
  {
    name: 'Customer',
    permissions: {}, // No admin permissions
  },
];

const permissionModules = ['Dashboard', 'Orders', 'Users', 'Inventory', 'Conversations', 'Purchase Orders', 'Accounting', 'Analytics', 'Settings'];
const permissionActions = ['View', 'Create', 'Edit', 'Delete'];


export default function SettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();

  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonials'), orderBy('name'));
  }, [firestore]);

  const { data: testimonials, loading: testimonialsLoading } = useCollection<Testimonial>(testimonialsQuery);

  // States for local form management
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageId, setHeroImageId] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription1, setAboutDescription1] = useState('');
  const [aboutDescription2, setAboutDescription2] = useState('');
  const [aboutImageId, setAboutImageId] = useState('');
  const [newTestimonial, setNewTestimonial] = useState({ name: '', location: '', comment: '', imageId: '' });
  
  const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '', twitter: '' });
  const [legalLinks, setLegalLinks] = useState({ terms: '', privacy: '', cookies: '' });
  const [openingHours, setOpeningHours] = useState('');

  const [measures, setMeasures] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [newMeasure, setNewMeasure] = useState('');
  const [newService, setNewService] = useState('');
  
  const [lagosLgas, setLagosLgas] = useState<LgaShippingZone[]>([]);
  const [newLgaName, setNewLgaName] = useState('');
  const [newLgaPrice, setNewLgaPrice] = useState(0);

  // Roles are now managed in state
  const [roles, setRoles] = useState(initialRoles);
  const [isNewRoleOpen, setNewRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState(0);

  // Populate local state when settings are loaded from Firestore
  useEffect(() => {
    if (settings) {
      setHeroTitle(settings.homepage?.heroTitle || "Authentic Nigerian Flavors, Delivered.");
      setHeroSubtitle(settings.homepage?.heroSubtitle || "From our kitchen to yours, experience the rich taste of Nigeria with our fresh ingredients and ready-to-eat soups.");
      setHeroImageId(settings.homepage?.heroImageId || 'https://picsum.photos/seed/hero/1200/800');
      setVideoId(settings.homepage?.videoId || 'dQw4w9WgXcQ');
      setVideoTitle(settings.homepage?.videoTitle || 'Our Story');
      setVideoDescription(settings.homepage?.videoDescription || 'A short description of the video.');
      setAboutTitle(settings.homepage?.aboutTitle || 'About BeautifulSoup&Food');
      setAboutDescription1(settings.homepage?.aboutDescription1 || 'Founded with a passion for preserving the authentic tastes of Nigerian cuisine...');
      setAboutDescription2(settings.homepage?.aboutDescription2 || 'Our commitment is to quality, freshness, and customer satisfaction...');
      setAboutImageId(settings.homepage?.aboutImageId || 'https://picsum.photos/seed/about/600/400');


      setSocialLinks(settings.footer?.socialLinks || { facebook: '', instagram: '', twitter: '' });
      setLegalLinks(settings.footer?.legalLinks || { terms: '/terms-of-service', privacy: '/privacy-policy', cookies: '/cookies-policy' });
      setOpeningHours(settings.footer?.openingHours || 'Mon - Fri: 9am - 6pm');
      
      setMeasures(settings.customOrder?.measures || ['Grams (g)', 'Kilograms (kg)', 'Pieces', 'Bunches', 'Wraps']);
      setServices(settings.customOrder?.services || ['Gift Wrapping', 'Special Packaging']);
      setLagosLgas(settings.shipping?.lagosLgas || []);
      
      setMonthlyRevenueGoal(settings.store?.monthlyRevenueGoal || 500000);
    }
  }, [settings]);

  const handleSaveHomepage = () => {
    updateSettings({
      homepage: { 
        heroTitle, heroSubtitle, heroImageId, 
        videoId, videoTitle, videoDescription,
        aboutTitle, aboutDescription1, aboutDescription2, aboutImageId
       }
    });
  };
  
  const handleAddTestimonial = async () => {
    if (!firestore || !newTestimonial.name || !newTestimonial.comment || !newTestimonial.imageId) {
        toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill out all fields for the testimonial.' });
        return;
    }
    try {
        await addDoc(collection(firestore, 'testimonials'), newTestimonial);
        setNewTestimonial({ name: '', location: '', comment: '', imageId: '' });
        toast({ title: 'Testimonial Added', description: 'The new testimonial has been added to your homepage.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add testimonial.' });
    }
  };

  const handleRemoveTestimonial = async (id: string) => {
      if (!firestore) return;
      try {
          await deleteDoc(doc(firestore, 'testimonials', id));
          toast({ title: 'Testimonial Removed', variant: 'destructive' });
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not remove testimonial.' });
      }
  };

  const handleSaveFooter = () => {
    updateSettings({ footer: { socialLinks, legalLinks, openingHours } });
  };
  
  const handleAddMeasure = () => {
    if (newMeasure.trim()) {
      const updatedMeasures = [...measures, newMeasure.trim()];
      setMeasures(updatedMeasures);
      setNewMeasure('');
      updateSettings({ customOrder: { ...settings?.customOrder, measures: updatedMeasures }});
    }
  };

  const handleRemoveMeasure = (measureToRemove: string) => {
    const updatedMeasures = measures.filter(m => m !== measureToRemove);
    setMeasures(updatedMeasures);
    updateSettings({ customOrder: { ...settings?.customOrder, measures: updatedMeasures }});
  };
  
  const handleAddService = () => {
    if (newService.trim()) {
      const updatedServices = [...services, newService.trim()];
      setServices(updatedServices);
      setNewService('');
      updateSettings({ customOrder: { ...settings?.customOrder, services: updatedServices }});
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    const updatedServices = services.filter(s => s !== serviceToRemove);
    setServices(updatedServices);
    updateSettings({ customOrder: { ...settings?.customOrder, services: updatedServices }});
  };
  
  const handleLgaPriceChange = (id: string, price: number) => {
    setLagosLgas(lgas => lgas.map(lga => lga.id === id ? { ...lga, price: isNaN(price) ? 0 : price } : lga));
  };
  
  const handleAddLga = () => {
    if (newLgaName.trim() && newLgaPrice > 0) {
      const newId = newLgaName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newLga: LgaShippingZone = {
        id: newId,
        name: newLgaName,
        price: newLgaPrice
      };
      setLagosLgas([...lagosLgas, newLga]);
      setNewLgaName('');
      setNewLgaPrice(0);
    } else {
      toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please provide a valid name and price for the new location.'})
    }
  };

  const handleRemoveLga = (id: string) => {
    setLagosLgas(lagosLgas.filter(lga => lga.id !== id));
  };

  const handleSaveShipping = () => {
      updateSettings({ shipping: { lagosLgas } });
  };
  
  const handleSaveStore = () => {
    updateSettings({ store: { monthlyRevenueGoal }});
  };

  const handleCreateRole = () => {
      if (newRoleName.trim()) {
          setRoles([...roles, { name: newRoleName.trim(), permissions: {} }]);
          setNewRoleName('');
          setNewRoleOpen(false);
          toast({ title: 'Role Created', description: `The role "${newRoleName.trim()}" has been successfully created. (This is a demo and is not saved)`});
      }
  };
  
  const handleDeleteRole = (roleName: string) => {
    setRoles(roles.filter(role => role.name !== roleName));
    toast({ title: 'Role Deleted', description: `The role "${roleName}" has been removed. (This is a demo and is not saved)`, variant: 'destructive'});
  }

  if (settingsLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <Skeleton className="h-10 w-full" />
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">Settings</h1>
      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="custom-order">Custom Order</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        
        {/* Store Settings */}
        <TabsContent value="store">
           <Card>
            <CardHeader>
              <CardTitle>Store Configuration</CardTitle>
              <CardDescription>
                Manage general store settings like analytics goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-medium">Analytics</h3>
                <div className="grid gap-2 max-w-sm">
                  <Label htmlFor="revenue-goal">Monthly Revenue Goal (₦)</Label>
                  <Input
                    id="revenue-goal"
                    type="number"
                    value={monthlyRevenueGoal}
                    onChange={e => setMonthlyRevenueGoal(parseInt(e.target.value, 10))}
                  />
                   <p className="text-sm text-muted-foreground">
                    This value is used to power the Monthly Goal Tracker on the Analytics page.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveStore}>Save Store Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Homepage Settings */}
        <TabsContent value="homepage">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Configuration</CardTitle>
              <CardDescription>
                Control the content displayed on your homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-medium">Hero Section</h3>
                <div className="grid gap-2">
                  <Label htmlFor="hero-title">Hero Section Title</Label>
                  <Input
                    id="hero-title"
                    value={heroTitle}
                    onChange={e => setHeroTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hero-subtitle">Hero Section Subtitle</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={heroSubtitle}
                    onChange={e => setHeroSubtitle(e.target.value)}
                  />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="hero-image-id">Hero Image URL</Label>
                  <Input
                    id="hero-image-id"
                    value={heroImageId}
                    onChange={e => setHeroImageId(e.target.value)}
                    placeholder="e.g., https://example.com/hero.jpg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                  <h3 className="font-medium">About Us Section</h3>
                  <div className="grid gap-2">
                      <Label htmlFor="about-title">Title</Label>
                      <Input id="about-title" value={aboutTitle} onChange={e => setAboutTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="about-desc-1">Description Paragraph 1</Label>
                      <Textarea id="about-desc-1" value={aboutDescription1} onChange={e => setAboutDescription1(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="about-desc-2">Description Paragraph 2</Label>
                      <Textarea id="about-desc-2" value={aboutDescription2} onChange={e => setAboutDescription2(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="about-image-id">Image URL</Label>
                      <Input id="about-image-id" value={aboutImageId} onChange={e => setAboutImageId(e.target.value)} />
                  </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Testimonials Section</h3>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testimonialsLoading ? (
                                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                            ) : testimonials.map(testimonial => (
                                <TableRow key={testimonial.id}>
                                    <TableCell className="font-medium">{testimonial.name}</TableCell>
                                    <TableCell>{testimonial.location}</TableCell>
                                    <TableCell className="max-w-xs truncate">{testimonial.comment}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveTestimonial(testimonial.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Card className="p-4 bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-end">
                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input value={newTestimonial.name} onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})} placeholder="e.g., Adeola A."/>
                        </div>
                        <div className="grid gap-2">
                            <Label>Location</Label>
                            <Input value={newTestimonial.location} onChange={e => setNewTestimonial({...newTestimonial, location: e.target.value})} placeholder="Lagos, NG"/>
                        </div>
                        <div className="grid gap-2">
                            <Label>Image URL</Label>
                            <Input value={newTestimonial.imageId} onChange={e => setNewTestimonial({...newTestimonial, imageId: e.target.value})} placeholder="https://..."/>
                        </div>
                         <div className="grid gap-2">
                            <Label>Comment</Label>
                            <Input value={newTestimonial.comment} onChange={e => setNewTestimonial({...newTestimonial, comment: e.target.value})} placeholder="Short quote..."/>
                        </div>
                         <Button onClick={handleAddTestimonial} className="self-end"><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                    </div>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Featured Video</h3>
                 <div className="grid gap-2">
                  <Label htmlFor="video-id">YouTube Video ID</Label>
                  <Input id="video-id" placeholder="e.g., dQw4w9WgXcQ" value={videoId} onChange={e => setVideoId(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video-title">Video Title</Label>
                  <Input id="video-title" placeholder="Our Story" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video-description">Video Description</Label>
                  <Textarea id="video-description" placeholder="A short description of the video." value={videoDescription} onChange={e => setVideoDescription(e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveHomepage}>Save Homepage</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Footer Settings */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Management</CardTitle>
              <CardDescription>
                Update footer links and business information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-4">
                <h3 className="font-medium">Social Media Links</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facebook-url">Facebook URL</Label>
                    <Input id="facebook-url" placeholder="https://facebook.com/yourpage" value={socialLinks.facebook} onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instagram-url">Instagram URL</Label>
                    <Input id="instagram-url" placeholder="https://instagram.com/yourprofile" value={socialLinks.instagram} onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="twitter-url">Twitter/X URL</Label>
                    <Input id="twitter-url" placeholder="https://twitter.com/yourhandle" value={socialLinks.twitter} onChange={e => setSocialLinks({...socialLinks, twitter: e.target.value})} />
                  </div>
                </div>
              </div>
               <div className="space-y-4">
                <h3 className="font-medium">Legal Pages</h3>
                 <div className="grid md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="terms-url">Terms of Service URL</Label>
                        <Input id="terms-url" placeholder="/terms-of-service" value={legalLinks.terms} onChange={e => setLegalLinks({...legalLinks, terms: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="privacy-url">Privacy Policy URL</Label>
                        <Input id="privacy-url" placeholder="/privacy-policy" value={legalLinks.privacy} onChange={e => setLegalLinks({...legalLinks, privacy: e.target.value})} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="cookies-url">Cookies Policy URL</Label>
                        <Input id="cookies-url" placeholder="/cookies-policy" value={legalLinks.cookies} onChange={e => setLegalLinks({...legalLinks, cookies: e.target.value})} />
                    </div>
                 </div>
              </div>
               <div className="space-y-4">
                <h3 className="font-medium">Business Information</h3>
                <div className="grid gap-2">
                  <Label htmlFor="opening-hours">Opening Hours</Label>
                  <Input id="opening-hours" placeholder="e.g., Mon - Fri: 9am - 6pm" value={openingHours} onChange={e => setOpeningHours(e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveFooter}>Save Footer</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Custom Order Settings */}
        <TabsContent value="custom-order">
          <Card>
            <CardHeader>
              <CardTitle>Custom Order Configuration</CardTitle>
              <CardDescription>
                Manage units of measure and additional services for custom orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-medium">Units of Measure</h3>
                <div className="space-y-2">
                    {measures.map((measure) => (
                        <div key={measure} className="flex items-center justify-between rounded-lg border p-2 pl-4">
                            <span>{measure}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveMeasure(measure)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newMeasure} onChange={(e) => setNewMeasure(e.target.value)} placeholder="Add new unit..." />
                  <Button onClick={handleAddMeasure}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Additional Services</h3>
                <div className="space-y-2">
                     {services.map((service) => (
                        <div key={service} className="flex items-center justify-between rounded-lg border p-2 pl-4">
                            <span>{service}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveService(service)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                   <Input value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Add new service..."/>
                   <Button onClick={handleAddService}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
            <Card>
                <CardHeader>
                    <CardTitle>Shipping Configuration</CardTitle>
                    <CardDescription>
                        Manage shipping zones and prices.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-medium">Lagos Delivery Zones (LGAs)</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Local Government Area</TableHead>
                                        <TableHead className="w-[200px] text-right">Price (₦)</TableHead>
                                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lagosLgas.map(lga => (
                                        <TableRow key={lga.id}>
                                            <TableCell className="font-medium">{lga.name}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    className="w-full text-right"
                                                    value={lga.price}
                                                    onChange={(e) => handleLgaPriceChange(lga.id, parseInt(e.target.value, 10))}
                                                    placeholder="0.00"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveLga(lga.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                         <Card className="p-4 bg-muted/50">
                            <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-end">
                                <div className="grid gap-2">
                                    <Label>New Location Name</Label>
                                    <Input value={newLgaName} onChange={e => setNewLgaName(e.target.value)} placeholder="e.g., Victoria Island"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Price (₦)</Label>
                                    <Input type="number" value={newLgaPrice} onChange={e => setNewLgaPrice(Number(e.target.value))} placeholder="0.00" />
                                </div>
                                <Button onClick={handleAddLga}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                            </div>
                        </Card>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveShipping}>Save Shipping Prices</Button>
                </CardFooter>
            </Card>
        </TabsContent>

        {/* Roles & Permissions */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>
                        Define user roles and their access levels across the application.
                    </CardDescription>
                </div>
                <Dialog open={isNewRoleOpen} onOpenChange={setNewRoleOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4"/> Create New Role</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="new-role-name">Role Name</Label>
                                <Input id="new-role-name" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g., Shipper" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setNewRoleOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateRole}>Create Role</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold w-[200px]">Role</TableHead>
                      {permissionModules.map(module => (
                        <TableHead key={module} className="text-center">{module}</TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.name}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        {permissionModules.map(module => {
                           const moduleKey = module.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                           return (
                               <TableCell key={module} className="text-center">
                                   {role.name !== 'Customer' ? (
                                    <div className="flex justify-center gap-2">
                                        {permissionActions.map(action => {
                                            const hasPermission = role.name === 'Owner' || (role.permissions[moduleKey as keyof typeof role.permissions] as string[])?.includes(action.toLowerCase());
                                            const isActionDisabled = (module === 'Dashboard' || module === 'Analytics') && action !== 'View';

                                            return (
                                                <Checkbox
                                                    key={action}
                                                    id={`${role.name}-${module}-${action}`}
                                                    aria-label={`${action} permission for ${module} in ${role.name} role`}
                                                    checked={hasPermission}
                                                    disabled={true}
                                                />
                                            )
                                        })}
                                    </div>
                                   ) : '-'}
                               </TableCell>
                           )
                        })}
                         <TableCell className="text-right">
                           <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                disabled={role.name === 'Owner' || role.name === 'Customer'}
                                onClick={() => handleDeleteRole(role.name)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
             <CardFooter>
                <p className="text-sm text-muted-foreground">Note: Role and permission changes here are for UI demonstration and are not saved to the backend.</p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    