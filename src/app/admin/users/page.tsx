
'use client';

import { useState, useMemo } from 'react';
import { users as initialUsers, User } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const RoleBadge = ({ role }: { role: User['role'] }) => {
    const variant = role === 'Owner' ? 'destructive' : role === 'Content Manager' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{role}</Badge>;
};

const StatusBadge = ({ status }: { status: User['status'] }) => {
    const variant = status === 'Active' ? 'default' : 'secondary';
    const className = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    return <Badge variant={variant} className={className}>{status}</Badge>;
}

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const avatar = PlaceHolderImages.find(p => p.id === 'avatar-1');

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(u => roleFilter === 'all' || u.role === roleFilter)
            .filter(u => statusFilter === 'all' || u.status === statusFilter);
    }, [users, searchTerm, roleFilter, statusFilter]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const handleOpenModal = (user: User | null = null) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const role = formData.get('role') as User['role'];

        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, name, email, role } : u));
            toast({ title: "User Updated", description: `${name} has been successfully updated.` });
        } else {
            const newUser: User = {
                id: `user-${Date.now()}`,
                name,
                email,
                role,
                joinDate: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                status: 'Active',
                avatarId: 'avatar-1',
            };
            setUsers([newUser, ...users]);
            toast({ title: "User Created", description: `A new account for ${name} has been created.` });
        }
        handleCloseModal();
    };

    const handleDeleteUser = (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        if (userToDelete) {
             setUsers(users.filter(u => u.id !== userId));
             toast({ variant: 'destructive', title: "User Deleted", description: `The account for ${userToDelete.name} has been deleted.`});
        }
    };
    
    const handleToggleStatus = (userId: string) => {
        const userToToggle = users.find(u => u.id === userId);
        if (userToToggle) {
            const newStatus = userToToggle.status === 'Active' ? 'Disabled' : 'Active';
            setUsers(users.map(u => u.id === userId ? {...u, status: newStatus} : u));
            toast({ title: "User Status Updated", description: `The account for ${userToToggle.name} has been ${newStatus.toLowerCase()}.`});
        }
    };
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold font-headline">User Management</h1>
                    <p className="text-muted-foreground">Manage users, roles, and permissions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Download CSV</Button>
                    <Button size="sm" className="gap-1" onClick={() => handleOpenModal()}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add User
                        </span>
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Input 
                            placeholder="Filter by name or email..." 
                            className="max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="ml-auto flex items-center gap-2">
                             <Select value={roleFilter} onValueChange={setRoleFilter}>
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
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                        {paginatedUsers.map((user) => (
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
                                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.role === 'Owner'}>
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleOpenModal(user)}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                                        {user.status === 'Active' ? 'Disable' : 'Enable'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>Delete</DropdownMenuItem>
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
                        Showing <strong>{paginatedUsers.length}</strong> of <strong>{filteredUsers.length}</strong> users
                    </div>
                     <Pagination className="ml-auto">
                        <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => {e.preventDefault(); handlePageChange(Math.max(1, currentPage - 1))}} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}/>
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => {e.preventDefault(); handlePageChange(i + 1)}}>{i + 1}</PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => {e.preventDefault(); handlePageChange(Math.min(totalPages, currentPage + 1))}} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}/>
                        </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            </Card>

             {isModalOpen && (
                 <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
                    <DialogContent>
                        <form onSubmit={handleSaveUser}>
                            <DialogHeader>
                                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                                <DialogDescription>
                                    {editingUser ? 'Update the details for this user.' : 'Create a new user account and assign a role.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" name="name" defaultValue={editingUser?.name} placeholder="Full Name" className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input id="email" name="email" type="email" defaultValue={editingUser?.email} placeholder="user@example.com" className="col-span-3" required/>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right">Role</Label>
                                    <Select name="role" defaultValue={editingUser?.role} required>
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
                                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                                <Button type="submit">{editingUser ? 'Save Changes' : 'Create User'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
