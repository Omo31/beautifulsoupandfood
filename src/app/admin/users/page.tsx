
'use client';

import { useState } from 'react';
import { users as initialUsers, User } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const RoleBadge = ({ role }: { role: User['role'] }) => {
    const variant = role === 'Owner' ? 'destructive' : role === 'Content Manager' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{role}</Badge>;
};

const StatusBadge = ({ status }: { status: User['status'] }) => {
    const variant = status === 'Active' ? 'default' : 'secondary';
    const className = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    return <Badge variant={variant} className={className}>{status}</Badge>;
}

export default function UsersPage() {
    const avatar = PlaceHolderImages.find(p => p.id === 'avatar-1');
    const [isAddUserOpen, setAddUserOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold font-headline">User Management</h1>
                    <p className="text-muted-foreground">Manage users, roles, and permissions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Download CSV</Button>
                     <Dialog open={isAddUserOpen} onOpenChange={setAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1">
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Add User
                                </span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                                <DialogDescription>
                                    Create a new user account and assign a role.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" placeholder="Full Name" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input id="email" type="email" placeholder="user@example.com" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right">Role</Label>
                                    <Select>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Customer">Customer</SelectItem>
                                            <SelectItem value="Content Manager">Content Manager</SelectItem>
                                            <SelectItem value="Owner">Owner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
                                <Button type="submit">Create User</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Input placeholder="Filter by name or email..." className="max-w-sm" />
                        <div className="ml-auto flex items-center gap-2">
                             <Select>
                                <SelectTrigger className="h-8 w-[150px]">
                                    <SelectValue placeholder="Filter by Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="Owner">Owner</SelectItem>
                                    <SelectItem value="Content Manager">Content Manager</SelectItem>
                                    <SelectItem value="Customer">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="h-8 w-[150px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Disabled">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialUsers.map((user) => (
                        <TableRow key={user.id} className={user.status === 'Disabled' ? 'opacity-50' : ''}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                    {avatar && <AvatarImage src={avatar.imageUrl} alt={user.name} />}
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <RoleBadge role={user.role} />
                            </TableCell>
                             <TableCell>
                                <StatusBadge status={user.status} />
                            </TableCell>
                            <TableCell>{format(new Date(user.joinDate), 'yyyy-MM-dd')}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>Disable</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>1-10</strong> of <strong>{initialUsers.length}</strong> users
                    </div>
                    <Pagination className="ml-auto">
                        <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            </Card>
        </div>
    );
}
