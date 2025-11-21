
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { convertToCSV, downloadCSV } from '@/lib/csv';
import { getFunctions, httpsCallable } from 'firebase/functions';

type UserWithStatus = UserProfile & { 
    id: string;
    status: 'Active' | 'Disabled'; 
    email: string;
};

const adminRoles = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Orders' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'purchase-orders', label: 'Purchase Orders' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];

const RoleBadge = ({ role }: { role: UserProfile['role'] }) => {
    const variant = role === 'Owner' ? 'destructive' : 'outline';
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
    const { user: currentUser } = useUser();
    
    const [allUsers, setAllUsers] = useState<UserWithStatus[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithStatus | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const functions = useMemo(() => getFunctions(), []);
    
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const getUsers = httpsCallable(functions, 'getAllUsers');
                const result = await getUsers();
                const usersData = result.data as UserWithStatus[];
                
                // Convert Firestore timestamps
                const processedUsers = usersData.map(u => ({
                  ...u,
                  createdAt: u.createdAt ? new Date((u.createdAt as any)._seconds * 1000) : new Date(),
                }));

                setAllUsers(processedUsers);
            } catch (error: any) {
                console.error("Error fetching users:", error);
                toast({
                    variant: 'destructive',
                    title: 'Failed to fetch users',
                    description: error.message || 'There was a problem retrieving the user list.'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [functions, toast]);


    const filteredUsers = useMemo(() => {
        return allUsers
            .filter(u => 
                u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .filter(u => roleFilter === 'all' || u.role === roleFilter)
            .filter(u => statusFilter === 'all' || u.status === statusFilter);
    }, [allUsers, searchTerm, roleFilter, statusFilter]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const handleOpenModal = (user: UserWithStatus) => {
        setEditingUser(user);
        setSelectedRoles(user.roles || []);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingUser(null);
        setSelectedRoles([]);
    };
    
    const handleRoleChange = (roleId: string, checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedRoles(prev => [...prev, roleId]);
        } else {
            setSelectedRoles(prev => prev.filter(r => r !== roleId));
        }
    };

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!firestore || !editingUser) return;
        
        const userDocRef = doc(firestore, 'users', editingUser.id);
        const updateData = {
            roles: selectedRoles
        };

        setDoc(userDocRef, updateData, { merge: true })
            .then(() => {
                toast({ title: "User Roles Updated", description: `${editingUser.firstName}'s roles have been updated.` });
                // Optimistically update local state
                setAllUsers(prev => prev.map(u => u.id === editingUser.id ? {...u, roles: selectedRoles} : u));
                handleCloseModal();
            })
            .catch(async (serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };
    
    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!firestore) return;
        
        try {
            const deleteUserFn = httpsCallable(functions, 'deleteUser');
            await deleteUserFn({ userId });
            
            toast({ variant: 'destructive', title: "User Deleted", description: `${userName} has been removed from the system.`});
            // Remove from local state
            setAllUsers(prev => prev.filter(u => u.id !== userId));

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: error.message || 'Could not delete the user.',
            });
        }
    };
    
    const handleToggleStatus = async (user: UserWithStatus) => {
        if (!firestore) return;

        const newDisabledStatus = user.status === 'Active';
        const newStatus = newDisabledStatus ? 'Disabled' : 'Active';

        try {
            const toggleUserStatus = httpsCallable(functions, 'toggleUserStatus');
            await toggleUserStatus({ userId: user.id, disabled: newDisabledStatus });

            toast({
                title: `User Account ${newStatus}`,
                description: `${user.firstName}'s account has been ${newStatus.toLowerCase()}.`,
            });
            // Optimistically update local state
            setAllUsers(prev => prev.map(u => u.id === user.id ? {...u, status: newStatus} : u));

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Action Failed',
                description: error.message || 'Could not update the user status.',
            });
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
            Permissions: u.roles?.join(', ') || 'None',
            Status: u.status,
            JoinDate: u.createdAt ? format(u.createdAt, 'yyyy-MM-dd') : 'N/A',
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
                        <TableHead>Permissions</TableHead>
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
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
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
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                    {user.role === 'Owner' ? <Badge variant="secondary">All</Badge> : (
                                        user.roles && user.roles.length > 0 ? (
                                            user.roles.map(role => <Badge key={role} variant="outline" className="capitalize">{role.replace('-', ' ')}</Badge>)
                                        ) : <span className="text-xs text-muted-foreground">None</span>
                                    )}
                                </div>
                            </TableCell>
                             <TableCell>
                                <StatusBadge status={user.status} />
                            </TableCell>
                            <TableCell>{user.createdAt ? format(user.createdAt, 'yyyy-MM-dd') : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.role === 'Owner' && user.id === currentUser?.uid}>
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleOpenModal(user)}>Edit Roles</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                        {user.status === 'Active' ? 'Disable' : 'Enable'} User
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}>Delete User</DropdownMenuItem>
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
                                <DialogTitle>Edit User Roles</DialogTitle>
                                <DialogDescription>
                                    Grant granular permissions for {editingUser.firstName} {editingUser.lastName}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <p className="text-sm font-medium">This user's primary role is <Badge variant="outline">{editingUser.role}</Badge>. Only an Owner can change this.</p>
                               <div>
                                   <Label className="font-semibold">Admin Section Access</Label>
                                   <div className="grid grid-cols-2 gap-2 rounded-lg border p-4 mt-2">
                                        {adminRoles.map(role => (
                                            <div key={role.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`role-${role.id}`} 
                                                    checked={selectedRoles.includes(role.id)}
                                                    onCheckedChange={(checked) => handleRoleChange(role.id, checked)}
                                                />
                                                <Label htmlFor={`role-${role.id}`} className="font-normal">{role.label}</Label>
                                            </div>
                                        ))}
                                   </div>
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

    
