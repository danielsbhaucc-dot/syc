'use client';

import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, ShieldAlert, PlusCircle, Loader, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Company {
  id: string;
  name: string;
}

interface Platoon {
    id: string;
    name: string;
}

function AddPlatoonDialog({ brigadeId, battalionId, companyId }: { brigadeId: string; battalionId: string, companyId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({ variant: "destructive", title: "שגיאה", description: "יש למלא שם מחלקה." });
      return;
    }
    setIsSubmitting(true);
    try {
      const platoonsCollection = collection(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies', companyId, 'platoons');
      await addDoc(platoonsCollection, {
        name,
        companyId,
        battalionId,
        brigadeId,
      });
      toast({ title: "הצלחה", description: "המחלקה נוספה בהצלחה." });
      setName("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding platoon:", error);
      toast({ variant: "destructive", title: "שגיאה", description: "אירעה שגיאה בהוספת המחלקה." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="ml-2" />
          הוסף מחלקה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת מחלקה חדשה</DialogTitle>
          <DialogDescription>
            הזן את שם המחלקה החדשה שברצונך להוסיף לפלוגה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                שם המחלקה
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="לדוגמה: מחלקת חבלה"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin ml-2" /> : null}
              {isSubmitting ? 'מוסיף...' : 'הוסף מחלקה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PlatoonsList({ brigadeId, battalionId, companyId }: { brigadeId: string, battalionId: string, companyId: string }) {
    const firestore = useFirestore();

    const platoonsQuery = useMemoFirebase(() => {
        if (!firestore || !brigadeId || !battalionId || !companyId) return null;
        return collection(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies', companyId, 'platoons');
    }, [firestore, brigadeId, battalionId, companyId]);

    const { data: platoons, isLoading, error } = useCollection<Platoon>(platoonsQuery);

    if (isLoading) {
        return (
             <div className="flex items-center justify-center text-muted-foreground p-12">
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                טוען מחלקות...
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">שגיאה בטעינת המחלקות: {error.message}</div>
    }

    return (
        <>
            {platoons && platoons.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>שם המחלקה</TableHead>
                            <TableHead className="text-right">פעולות</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {platoons.map((platoon) => (
                            <TableRow key={platoon.id}>
                                <TableCell className="font-medium">{platoon.name}</TableCell>
                                <TableCell className="text-right">
                                     <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/battalion/${battalionId}/company/${companyId}/platoon/${platoon.id}`}>
                                            ניהול כיתות
                                            <ArrowUpRight className="mr-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                    <Users className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        אין עדיין מחלקות בפלוגה זו
                    </h3>
                    <p className="max-w-md mb-6">
                        התחל על ידי הוספת המחלקה הראשונה לפלוגה.
                    </p>
                    <AddPlatoonDialog brigadeId={brigadeId} battalionId={battalionId} companyId={companyId} />
                </div>
            )}
        </>
    )
}


function CompanyLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      <Skeleton className="h-9 w-64" />
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>מחלקות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <Loader className="w-16 h-16 mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              טוען מחלקות...
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompanyPage() {
  const params = useParams();
  const firestore = useFirestore();
  const { user } = useUser();

  const battalionId = params.battalionId as string;
  const companyId = params.companyId as string;
  // This is a simplification. In a real app, you'd probably get the brigadeId
  // from a different source, maybe stored with the user profile or battalion doc.
  // For now, we assume the logged-in user's UID is the brigade ID.
  const brigadeId = user?.uid;

  const companyRef = useMemoFirebase(() => {
    if (!firestore || !brigadeId || !battalionId || !companyId) return null;
    return doc(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies', companyId);
  }, [firestore, brigadeId, battalionId, companyId]);

  const { data: company, isLoading, error } = useDoc<Company>(companyRef);

  if (isLoading || !company || !brigadeId) {
    return <CompanyLoading />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center" dir="rtl">
        <ShieldAlert className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">אירעה שגיאה</h2>
        <p>לא ניתן היה לטעון את נתוני הפלוגה.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter">
            פלוגה: {company.name}
          </h1>
          <Link href={`/dashboard/battalion/${battalionId}`} className="text-sm text-blue-400 hover:underline">
            חזרה לגדוד
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>מחלקות</CardTitle>
          <AddPlatoonDialog brigadeId={brigadeId} battalionId={battalionId} companyId={companyId} />
        </CardHeader>
        <CardContent>
            <PlatoonsList brigadeId={brigadeId} battalionId={battalionId} companyId={companyId} />
        </CardContent>
      </Card>
    </div>
  );
}
