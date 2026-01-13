'use client';

import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, FileText, PlusCircle, Loader, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface Template {
  id: string;
  name: string;
  description: string;
}

interface Role {
    id: string;
    name: string;
    requiredAuthorizations: string;
    requiredEquipment: string;
}

function AddRoleDialog({ brigadeId, templateId }: { brigadeId: string, templateId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [authorizations, setAuthorizations] = useState("");
  const [equipment, setEquipment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({ variant: "destructive", title: "שגיאה", description: "יש למלא שם תפקיד." });
      return;
    }
    setIsSubmitting(true);
    try {
      const rolesCollection = collection(firestore, 'brigades', brigadeId, 'templates', templateId, 'roles');
      await addDoc(rolesCollection, {
        name,
        requiredAuthorizations: authorizations,
        requiredEquipment: equipment,
        templateId,
        brigadeId,
      });
      toast({ title: "הצלחה", description: "התפקיד נוסף לתבנית." });
      setName("");
      setAuthorizations("");
      setEquipment("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding role:", error);
      toast({ variant: "destructive", title: "שגיאה", description: "אירעה שגיאה בהוספת התפקיד." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="ml-2" />
          הוסף תפקיד לתבנית
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת תפקיד חדש</DialogTitle>
          <DialogDescription>
            הגדר את פרטי התפקיד כחלק מהתקן.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                שם התפקיד
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="לדוגמה: נגביסט"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="auth" className="text-right">
                הכשרות נדרשות
              </Label>
              <Input
                id="auth"
                value={authorizations}
                onChange={(e) => setAuthorizations(e.target.value)}
                className="col-span-3"
                placeholder="הסמכת נגב, רובאי 07..."
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equip" className="text-right">
                ציוד נדרש
              </Label>
              <Textarea
                id="equip"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="col-span-3"
                placeholder="נגב, כוונת, קנה רזרבי..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin ml-2" /> : null}
              {isSubmitting ? 'מוסיף...' : 'הוסף תפקיד'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function TemplateLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      <Skeleton className="h-9 w-64" />
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>תפקידים בתבנית</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <Loader className="w-16 h-16 mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              טוען תפקידים...
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RolesList({ brigadeId, templateId }: { brigadeId: string, templateId: string }) {
    const firestore = useFirestore();

    const rolesQuery = useMemoFirebase(() => {
        if (!firestore || !brigadeId || !templateId) return null;
        return collection(firestore, 'brigades', brigadeId, 'templates', templateId, 'roles');
    }, [firestore, brigadeId, templateId]);

    const { data: roles, isLoading, error } = useCollection<Role>(rolesQuery);

    if (isLoading) {
        return (
             <div className="flex items-center justify-center text-muted-foreground p-12">
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                טוען תפקידים...
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">שגיאה בטעינת התפקידים: {error.message}</div>
    }

    return (
        <>
            {roles && roles.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>שם התפקיד</TableHead>
                            <TableHead>הכשרות נדרשות</TableHead>
                             <TableHead>ציוד נדרש</TableHead>
                            <TableHead className="text-right">פעולות</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">{role.name}</TableCell>
                                 <TableCell>{role.requiredAuthorizations || '-'}</TableCell>
                                <TableCell>{role.requiredEquipment || '-'}</TableCell>
                                <TableCell className="text-right">
                                     <Button variant="ghost" size="sm">
                                            ערוך
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                    <FileText className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        אין עדיין תפקידים בתבנית זו
                    </h3>
                    <p className="max-w-md mb-6">
                        התחל על ידי הוספת התפקיד הראשון כדי להגדיר את התקן.
                    </p>
                    <AddRoleDialog brigadeId={brigadeId} templateId={templateId} />
                </div>
            )}
        </>
    )
}

export default function TemplateEditPage() {
  const params = useParams();
  const firestore = useFirestore();
  const { user } = useUser();

  const templateId = params.templateId as string;
  const brigadeId = user?.uid;

  const templateRef = useMemoFirebase(() => {
    if (!firestore || !brigadeId || !templateId) return null;
    return doc(firestore, 'brigades', brigadeId, 'templates', templateId);
  }, [firestore, brigadeId, templateId]);

  const { data: template, isLoading, error } = useDoc<Template>(templateRef);

  if (isLoading || !template || !brigadeId) {
    return <TemplateLoading />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center" dir="rtl">
        <ShieldAlert className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">אירעה שגיאה</h2>
        <p>לא ניתן היה לטעון את נתוני התבנית.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter">
            עריכת תבנית: {template.name}
          </h1>
          <Link href={`/dashboard/templates`} className="text-sm text-blue-400 hover:underline">
             <div className='flex items-center'>
                <ArrowRight className="ml-1 h-3 w-3" />
                חזרה לרשימת התבניות
             </div>
          </Link>
        </div>
      </div>
      
       <Card>
        <CardHeader>
            <CardTitle>פרטי התבנית</CardTitle>
        </CardHeader>
        <CardContent>
            <p className='text-muted-foreground'>{template.description || 'לא סופק תיאור.'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>תפקידים בתבנית</CardTitle>
          <AddRoleDialog brigadeId={brigadeId} templateId={templateId} />
        </CardHeader>
        <CardContent>
            <RolesList brigadeId={brigadeId} templateId={templateId} />
        </CardContent>
      </Card>
    </div>
  );
}
