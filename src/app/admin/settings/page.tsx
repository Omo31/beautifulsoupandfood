
'use client';

import { useState, useMemo, type FormEvent } from 'react';
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
  MoreHorizontal,
  FilePenLine,
  PackageSearch,
  Gift,
  Boxes,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { lagosLgas as initialLagosLgas, LgaShippingZone } from '@/lib/shipping';
import { homepageServices as initialHomepageServices, HomepageService, Testimonial } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';


const initialRoles = [
  {
    name: 'Owner',
    permissions: {},
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
    permissions: {},
  },
];

const permissionModules = ['Dashboard', 'Orders', 'Users', 'Inventory', 'Conversations', 'Purchase Orders', 'Accounting', 'Analytics', 'Settings'];
const permissionActions = ['View', 'Create', 'Edit', 'Delete'];

const initialMeasures = ['Grams (g)', 'Kilograms (kg)', 'Pieces', 'Bunches', 'Wraps'];
const initialServices = ['Gift Wrapping', 'Special Packaging'];

export default function SettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'testimonials');
  }, [firestore]);
  const { data: testimonials, loading: testimonialsLoading } = useCollection<Testimonial>(testimonialsQuery);

  
  // States for Homepage settings
  const [heroTitle, setHeroTitle] = useState("Authentic Nigerian Flavors, Delivered.");
  const [heroSubtitle, setHeroSubtitle] = useState("From our kitchen to yours, experience the rich taste of Nigeria with our fresh ingredients and ready-to-eat soups.");
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [videoTitle, setVideoTitle] = useState("Our Story");
  const [videoDescription, setVideoDescription] = useState("A short description of the video.");
  const [homepageServices, setHomepageServices] = useState<HomepageService[]>(initialHomepageServices);
  const [newHomepageService, setNewHomepageService] = useState({ name: '', description: '', iconName: 'PackageSearch' as HomepageService['iconName'] });
  const [newTestimonial, setNewTestimonial] = useState({ name: '', location: '', comment: '', imageId: '' });


  // States for Footer settings
  const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '', twitter: '' });
  const [legalLinks, setLegalLinks] = useState({ terms: '/terms-of-service', privacy: '/privacy-policy' });
  const [openingHours, setOpeningHours] = useState('Mon - Fri: 9am - 6pm');
  
  // States for Custom Order settings
  const [measures, setMeasures] = useState(initialMeasures);
  const [services, setServices] = useState(initialServices);
  const [newMeasure, setNewMeasure] = useState('');
  const [newService, setNewService] = useState('');

  // State for Shipping settings
  const [lagosLgas, setLagosLgas] = useState<LgaShippingZone[]>(initialLagosLgas);

  // States for Roles & Permissions settings
  const [roles, setRoles] = useState(initialRoles);
  const [isNewRoleOpen, setNewRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  
  const showToast = (title: string, description: string) => {
    toast({ title, description });
  };

  const handleAddHomepageService = () => {
    if (newHomepageService.name.trim() && newHomepageService.description.trim()) {
        const newService: HomepageService = {
            id: `service-${Date.now()}`,
            ...newHomepageService
        };
        setHomepageServices([...homepageServices, newService]);
        setNewHomepageService({ name: '', description: '', iconName: 'PackageSearch' });
    }
  };

  const handleRemoveHomepageService = (id: string) => {
    setHomepageServices(homepageServices.filter(s => s.id !== id));
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


  const handleAddMeasure = () => {
    if (newMeasure.trim()) {
      setMeasures([...measures, newMeasure.trim()]);
      setNewMeasure('');
    }
  };

  const handleRemoveMeasure = (measureToRemove: string) => {
    setMeasures(measures.filter(m => m !== measureToRemove));
  };
  
  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter(s => s !== serviceToRemove));
  };
  
  const handleLgaPriceChange = (id: string, price: number) => {
    setLagosLgas(lgas => lgas.map(lga => lga.id === id ? { ...lga, price: isNaN(price) ? 0 : price } : lga));
  };
  
  const handleCreateRole = () => {
      if (newRoleName.trim()) {
          setRoles([...roles, { name: newRoleName.trim(), permissions: {} }]);
          setNewRoleName('');
          setNewRoleOpen(false);
          showToast('Role Created', `The role "${newRoleName.trim()}" has been successfully created.`);
      }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">Settings</h1>
      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="custom-order">Custom Order</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

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
                            <Label>Image ID</Label>
                            <Input value={newTestimonial.imageId} onChange={e => setNewTestimonial({...newTestimonial, imageId: e.target.value})} placeholder="testimonial-1"/>
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
              <Button onClick={() => showToast('Changes Saved', 'Your homepage settings have been updated.')}>Save Changes</Button>
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
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="terms-url">Terms of Service URL</Label>
                        <Input id="terms-url" placeholder="/terms-of-service" value={legalLinks.terms} onChange={e => setLegalLinks({...legalLinks, terms: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="privacy-url">Privacy Policy URL</Label>
                        <Input id="privacy-url" placeholder="/privacy-policy" value={legalLinks.privacy} onChange={e => setLegalLinks({...legalLinks, privacy: e.target.value})} />
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
              <Button onClick={() => showToast('Changes Saved', 'Your footer settings have been updated.')}>Save Changes</Button>
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
             <CardFooter>
                <Button onClick={() => showToast('Configurations Saved', 'Your custom order settings have been updated.')}>Save Configurations</Button>
            </CardFooter>
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lagosLgas.map(lga => (
                                        <TableRow key={lga.id}>
                                            <TableCell className="font-medium">{lga.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Input 
                                                    type="number" 
                                                    className="w-full text-right"
                                                    value={lga.price}
                                                    onChange={(e) => handleLgaPriceChange(lga.id, parseInt(e.target.value, 10))}
                                                    placeholder="0.00"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => showToast('Prices Saved', 'Your shipping prices have been updated.')}>Save Shipping Prices</Button>
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
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>
                        Define the name and permissions for the new role.
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                        <div className="space-y-4 py-4 pr-1">
                            <div className="space-y-2">
                                <Label htmlFor="role-name">Role Name</Label>
                                <Input id="role-name" placeholder="e.g., Shipper" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Module</TableHead>
                                                {permissionActions.map(action => <TableHead key={action} className="text-center">{action}</TableHead>)}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {permissionModules.map(module => (
                                                <TableRow key={module}>
                                                    <TableCell className="font-medium">{module}</TableCell>
                                                    {permissionActions.map(action => (
                                                        <TableCell key={action} className="text-center">
                                                            <Checkbox aria-label={`${action} on ${module}`} />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewRoleOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateRole}>Save Role</Button>
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
                      <TableHead className="font-bold">Role</TableHead>
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
                                                    disabled={role.name === 'Owner' || isActionDisabled}
                                                />
                                            )
                                        })}
                                    </div>
                                   ) : '-'}
                               </TableCell>
                           )
                        })}
                        <TableCell className="text-right">
                          {role.name !== 'Owner' && role.name !== 'Customer' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem><FilePenLine className="mr-2 h-4 w-4" /> Edit Role</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Role</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
             <CardFooter>
                <Button onClick={() => showToast('Permissions Saved', 'The roles and permissions have been updated.')}>Save Permissions</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
    

    