
'use client';

import { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, File } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { convertToCSV, downloadCSV } from '@/lib/csv';
import { getFunctions, httpsCallable } from 'firebase/functions';

type UserWithStatus = UserProfile & { 
    status: 'Active' | 'Disabled'; 
    email: string; // Assuming email is available on the user object, not profile
};

const RoleBadge = ({ role }: { role: UserProfile['role'] }) => {
    const variant = role === 'Owner' ? 'destructive' : role === 'Content Manager' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{role}</Badge>;
};

const StatusBadge = ({ status }: { status: UserWithStatus['status'] }) => {
    const variant = status === 'Active' ? 'default' : 'secondary';
    const className = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    return <Badge variant={variant} className={className}>{status}</Badge>;
}

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: userProfiles, loading } = useCollection<UserProfile>(usersQuery);
    
    const users: UserWithStatus[] = useMemo(() => {
        return userProfiles.map((profile, i) => ({
            ...profile,
            email: `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}@example.com`,
            status: 'Active'
        }));
    }, [userProfiles]);
    

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithStatus | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => 
                u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(u => roleFilter === 'all' || u.role === roleFilter)
            .filter(u => statusFilter === 'all' || u.status === statusFilter);
    }, [users, searchTerm, roleFilter, statusFilter]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const handleOpenModal = (user: UserWithStatus) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!firestore || !editingUser) return;
        
        const formData = new FormData(e.currentTarget);
        const newRole = formData.get('role') as UserProfile['role'];

        try {
            const functions = getFunctions();
            const setUserRole = httpsCallable(functions, 'setUserRole');
            await setUserRole({ userId: editingUser.id, newRole: newRole });
            
            // Also update the local Firestore profile document for immediate UI feedback if needed
            // This is optional as the primary source of truth for roles should be the auth token
            const userDocRef = doc(firestore, 'users', editingUser.id);
            await setDoc(userDocRef, { role: newRole }, { merge: true });

            toast({ title: "User Role Updated", description: `${editingUser.firstName}'s role has been set to ${newRole}.` });
            handleCloseModal();
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'You do not have permission to perform this action.'
            });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', userId);
        deleteDoc(userDocRef).then(() => {
            toast({ variant: 'destructive', title: "User Deleted", description: "The user profile has been deleted."});
        }).catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    };
    
    const handleToggleStatus = (userId: string) => {
        const userToToggle = users.find(u => u.id === userId);
        if (userToToggle) {
            toast({ title: "Status Update Mock", description: `This is a mock action. In a real app, this would disable the user's Firebase Auth account.`});
        }
    };
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleExport = () => {
        const dataToExport = filteredUsers.map(u => ({
            UserID: u.id,
            FirstName: u.firstName,
            LastName: u.lastName,
            Email: u.email,
            Role: u.role,
            Status: u.status,
            JoinDate: u.createdAt ? format(u.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A',
        }));
        const csv = convertToCSV(dataToExport);
        downloadCSV(csv, `users-export-${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold font-headline">User Management</h1>
                    <p className="text-muted-foreground">Manage users and their roles. New users must sign up through the main site.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
                        <File className="h-3.5 w-3.5" />
                        <span>Download CSV</span>
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
                        {loading ? (
                            [...Array(5)].map((_,i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : paginatedUsers.map((user) => (
                        <TableRow key={user.id} className={user.status === 'Disabled' ? 'opacity-50' : ''}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.firstName} {user.lastName}</p>
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
                            <TableCell>{user.createdAt ? format(user.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</TableCell>
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
                                    <DropdownMenuItem onClick={() => handleOpenModal(user)}>Edit Role</DropdownMenuItem>
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

             {isModalOpen && editingUser && (
                 <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
                    <DialogContent>
                        <form onSubmit={handleSaveUser}>
                            <DialogHeader>
                                <DialogTitle>Edit User Role</DialogTitle>
                                <DialogDescription>
                                    Change the permission level for {editingUser.firstName} {editingUser.lastName}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input id="email" name="email" type="email" defaultValue={editingUser?.email} className="col-span-3" disabled/>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right">Role</Label>
                                    <Select name="role" defaultValue={editingUser?.role || 'Customer'} required>
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
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
