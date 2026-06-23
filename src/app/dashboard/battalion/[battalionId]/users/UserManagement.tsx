
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';

// Define a type for our user data for better type-safety
interface User {
    id: string;
    name: string;
    role: string;
}

export default function UserManagement({ battalionId }: { battalionId: string }) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentUser, setCurrentUser] = useState<Partial<User>>({ name: '', role: '' });

    const apiEndpoint = `/api/battalion/${battalionId}/users`;

    // Function to fetch users from the API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users.');
            }
            const data = await response.json();
            setUsers(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch users when the component mounts or battalionId changes
    useEffect(() => {
        fetchUsers();
    }, [battalionId]);

    // Function to handle saving a new or edited user
    const handleSaveChanges = async () => {
        if (!currentUser.name || !currentUser.role) return;

        const method = dialogMode === 'add' ? 'POST' : 'PUT';
        const body = JSON.stringify(currentUser);

        try {
            const response = await fetch(apiEndpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save user.');
            }
            
            await fetchUsers(); // Refetch users to update the list
            setIsDialogOpen(false);
        } catch (e: any) {
            alert(`Error saving user: ${e.message}`); // Provide feedback
        }
    };

    // Function to handle deleting a user
    const handleRemoveUser = async (userId: string) => {
        if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) return;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user.');
            }
            
            await fetchUsers(); // Refetch
        } catch (e: any) {
             alert(`Error deleting user: ${e.message}`);
        }
    };
    
    // Dialog handling functions
    const openAddDialog = () => {
        setDialogMode('add');
        setCurrentUser({ name: '', role: '' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (user: User) => {
        setDialogMode('edit');
        setCurrentUser(user);
        setIsDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>רשימת משתמשים</CardTitle>
                <Button onClick={openAddDialog} size="sm" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    הוסף משתמש
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
                    </div>
                ) : error ? (
                     <div className="text-red-500 text-center p-8">שגיאה בטעינת המשתמשים: {error}</div>
                ) : (
                    <Table dir="rtl">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">שם</TableHead>
                                <TableHead className="text-right">תפקיד</TableHead>
                                <TableHead className="text-right">פעולות</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium text-right">{user.name}</TableCell>
                                    <TableCell className="text-right">{user.role}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(user)}>ערוך פרטים</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRemoveUser(user.id)} className="text-red-500 hover:text-red-500 hover:bg-red-100">הסר משתמש</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'add' ? 'הוספת משתמש חדש' : 'עריכת פרטי משתמש'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">שם</Label>
                            <Input id="name" value={currentUser.name} onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">תפקיד</Label>
                            <Input id="role" value={currentUser.role} onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
                        <Button onClick={handleSaveChanges}>שמור שינויים</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
