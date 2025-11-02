
'use client';

import { useState } from 'react';
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

const initialRoles = [
  {
    name: 'Owner',
    permissions: {
      dashboard: ['view'],
      orders: ['view', 'create', 'edit', 'delete'],
      users: ['view', 'create', 'edit', 'delete'],
      inventory: ['view', 'create', 'edit', 'delete'],
      conversations: ['view', 'create', 'edit', 'delete'],
      'purchase orders': ['view', 'create', 'edit', 'delete'],
      accounting: ['view', 'create', 'edit', 'delete'],
      analytics: ['view'],
      settings: ['view', 'create', 'edit', 'delete'],
    },
  },
  {
    name: 'Content Manager',
    permissions: {
      dashboard: ['view'],
      orders: ['view', 'edit'],
      users: [],
      inventory: ['view', 'create', 'edit'],
      conversations: ['view', 'create'],
      'purchase orders': ['view'],
      accounting: [],
      analytics: [],
      settings: [],
    },
  },
  {
    name: 'Customer',
    permissions: {
      dashboard: [],
      orders: [],
      users: [],
      inventory: [],
      conversations: [],
      'purchase orders': [],
      accounting: [],
      analytics: [],
      settings: [],
    },
  },
];

const permissionModules = ['Dashboard', 'Orders', 'Users', 'Inventory', 'Conversations', 'Purchase Orders', 'Accounting', 'Analytics', 'Settings'];
const permissionActions = ['View', 'Create', 'Edit', 'Delete'];

const initialMeasures = ['Grams (g)', 'Kilograms (kg)', 'Pieces', 'Bunches', 'Wraps'];
const initialServices = ['Gift Wrapping', 'Special Packaging'];

export default function SettingsPage() {
  const [measures, setMeasures] = useState(initialMeasures);
  const [services, setServices] = useState(initialServices);
  const [newMeasure, setNewMeasure] = useState('');
  const [newService, setNewService] = useState('');
  const [isNewRoleOpen, setNewRoleOpen] = useState(false);

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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">Settings</h1>
      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="custom-order">Custom Order</TabsTrigger>
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
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Hero Section</h3>
                <div className="grid gap-2">
                  <Label htmlFor="hero-title">Hero Section Title</Label>
                  <Input
                    id="hero-title"
                    defaultValue="Authentic Nigerian Flavors, Delivered."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hero-subtitle">Hero Section Subtitle</Label>
                  <Textarea
                    id="hero-subtitle"
                    defaultValue="From our kitchen to yours, experience the rich taste of Nigeria with our fresh ingredients and ready-to-eat soups."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Featured Video</h3>
                 <div className="grid gap-2">
                  <Label htmlFor="video-id">YouTube Video ID</Label>
                  <Input id="video-id" placeholder="e.g., dQw4w9WgXcQ" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video-title">Video Title</Label>
                  <Input id="video-title" placeholder="Our Story" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video-description">Video Description</Label>
                  <Textarea id="video-description" placeholder="A short description of the video."/>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
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
                    <Input id="facebook-url" placeholder="https://facebook.com/yourpage" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instagram-url">Instagram URL</Label>
                    <Input id="instagram-url" placeholder="https://instagram.com/yourprofile" />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="twitter-url">Twitter/X URL</Label>
                    <Input id="twitter-url" placeholder="https://twitter.com/yourhandle" />
                  </div>
                </div>
              </div>
               <div className="space-y-4">
                <h3 className="font-medium">Legal Pages</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="terms-url">Terms of Service URL</Label>
                        <Input id="terms-url" placeholder="/terms-of-service" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="privacy-url">Privacy Policy URL</Label>
                        <Input id="privacy-url" placeholder="/privacy-policy" />
                    </div>
                 </div>
              </div>
               <div className="space-y-4">
                <h3 className="font-medium">Business Information</h3>
                <div className="grid gap-2">
                  <Label htmlFor="opening-hours">Opening Hours</Label>
                  <Input id="opening-hours" placeholder="e.g., Mon - Fri: 9am - 6pm" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
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
                <Button>Save Configurations</Button>
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
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Role Name</Label>
                            <Input id="role-name" placeholder="e.g., Shipper" />
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
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewRoleOpen(false)}>Cancel</Button>
                      <Button onClick={() => setNewRoleOpen(false)}>Save Role</Button>
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
                    {initialRoles.map((role) => (
                      <TableRow key={role.name}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        {permissionModules.map(module => (
                           <TableCell key={module} className="text-center">
                               {role.name !== 'Customer' ? (
                                <div className="flex justify-center gap-2">
                                    {permissionActions.map(action => {
                                        const hasPermission = role.permissions[module.toLowerCase() as keyof typeof role.permissions]?.includes(action.toLowerCase());
                                        const isActionDisabled = (module === 'Dashboard' || module === 'Analytics') && action !== 'View';

                                        return (
                                            <Checkbox
                                                key={action}
                                                id={`${role.name}-${module}-${action}`}
                                                aria-label={`${action} permission for ${module} in ${role.name} role`}
                                                defaultChecked={hasPermission}
                                                disabled={role.name === 'Owner' || isActionDisabled}
                                            />
                                        )
                                    })}
                                </div>
                               ) : '-'}
                           </TableCell>
                        ))}
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
                <Button>Save Permissions</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
