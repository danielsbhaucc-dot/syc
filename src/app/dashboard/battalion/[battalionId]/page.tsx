'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, DocumentData, collection, addDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MapPin, ShieldAlert, PlusCircle, Loader, ArrowRight, FileText, UserPlus, FileWarning } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Battalion {
    id: string;
    name: string;
    location: string;
    templateId?: string;
}

interface Company {
    id: string;
    name: string;
}

interface Template {
    id: string;
    name: string;
}

function AddBattalionUserDialog({ brigadeId, battalionId, battalionName }: { brigadeId: string, battalionId: string, battalionName: string }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ variant: "destructive", title: "שגיאה", description: "יש למלא אימייל וסיסמה." });
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, battalionId, brigadeId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'אירעה שגיאה ביצירת המשתמש.');
            }

            toast({ title: "הצלחה", description: `משתמש נוצר בהצלחה עבור ${battalionName}.` });
            setEmail("");
            setPassword("");
            setOpen(false);
        } catch (error: any) {
            console.error("Error creating battalion user:", error);
            toast({ variant: "destructive", title: "שגיאה", description: error.message || "אירעה שגיאה ביצירת המשתמש." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Button variant="outline">
                    <UserPlus className="ml-2 h-4 w-4" />
                    הוסף משתמש לגדוד
                </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">יצירת משתמש חדש לגדוד</DialogTitle>
                    <DialogDescription>המשתמש שייוצר יקבל גישה לניהול הנתונים של גדוד \"{battalionName}\" בלבד.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <Label htmlFor="email">אימייל</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
                    </div>
                    <div>
                        <Label htmlFor="password">סיסמה</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="סיסמה חזקה" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'צור משתמש'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AddCompanyDialog({ brigadeId, battalionId }: { brigadeId: string; battalionId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({ variant: "destructive", title: "שגיאה", description: "יש למלא שם פלוגה." });
      return;
    }
    setIsSubmitting(true);
    try {
      const companiesCollection = collection(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies');
      await addDoc(companiesCollection, {
        name,
        battalionId,
        brigadeId,
      });
      toast({ title: "הצלחה", description: "הפלוגה נוספה בהצלחה." });
      setName("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding company:", error);
      toast({ variant: "destructive", title: "שגיאה", description: "אירעה שגיאה בהוספת הפלוגה." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="ml-2 h-4 w-4" />
          הוסף פלוגה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת פלוגה חדשה</DialogTitle>
          <DialogDescription>
            הזן את שם הפלוגה החדשה שברצונך להוסיף לגדוד.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                שם הפלוגה
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="לדוגמה: פלוגת חוד"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin mr-2 h-4 w-4" /> : null}
              {isSubmitting ? 'מוסיף...' : 'הוסף פלוגה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function CompaniesList({ brigadeId, battalionId }: { brigadeId: string; battalionId: string }) {
    const firestore = useFirestore();
    const companiesQuery = useMemoFirebase(() => {
        if (!firestore || !brigadeId || !battalionId) return null;
        return collection(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies');
    }, [firestore, brigadeId, battalionId]);

    const { data: companies, isLoading, error } = useCollection<Company>(companiesQuery);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center text-muted-foreground p-12">
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                טוען פלוגות...
            </div>
        );
    }
    
    if (error) {
        return <div className="text-red-500 text-center p-4">שגיאה בטעינת הפלוגות: {error.message}</div>;
    }

    return (
         <>
            {companies && companies.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>שם הפלוגה</TableHead>
                            <TableHead className="text-right">פעולות</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell className="font-medium">{company.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/battalion/${battalionId}/company/${company.id}`}>
                                            נהל מחלקות
                                            <ArrowRight className="mr-2 h-4 w-4" />
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
                        אין עדיין פלוגות בגדוד
                    </h3>
                    <p className="max-w-md mb-6">
                        התחל על ידי הוספת הפלוגה הראשונה לגדוד.
                    </p>
                    {brigadeId && battalionId && <AddCompanyDialog brigadeId={brigadeId} battalionId={battalionId} />}
                </div>
            )}
        </>
    )
}

function AssignTemplateCard({ brigadeId, battalionId, currentTemplateId }: { brigadeId: string, battalionId: string, currentTemplateId?: string }) {
    const firestore = useFirestore();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(currentTemplateId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const templatesQuery = useMemoFirebase(() => {
        if (!firestore || !brigadeId) return null;
        return collection(firestore, 'brigades', brigadeId, 'templates');
    }, [firestore, brigadeId]);

    const { data: templates, isLoading } = useCollection<Template>(templatesQuery);

    const handleAssign = async () => {
        if (!selectedTemplateId) {
            toast({ variant: "destructive", title: "שגיאה", description: "יש לבחור תבנית." });
            return;
        }
        setIsSubmitting(true);
        try {
            const battalionRef = doc(firestore, 'brigades', brigadeId, 'battalions', battalionId);
            await updateDoc(battalionRef, { templateId: selectedTemplateId });
            toast({ title: "הצלחה", description: "התבנית שויכה לגדוד בהצלחה." });
        } catch (error) {
            console.error("Error assigning template:", error);
            toast({ variant: "destructive", title: "שגיאה", description: "אירעה שגיאה בשיוך התבנית." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const selectedTemplateName = templates?.find(t => t.id === currentTemplateId)?.name;

    return (
        <Card>
            <CardHeader>
                <CardTitle>שיוך תבנית תקן</CardTitle>
                 <CardDescription>שיוך תבנית יגדיר את תקן כוח האדם והציוד עבור הגדוד.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentTemplateId && (
                    <div className="text-sm p-3 bg-success/10 border border-success/20 rounded-md">
                        <p className="font-semibold text-green-300">תבנית משויכת כעת: <span className="font-bold">{selectedTemplateName || 'טוען...'}</span></p>
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId} disabled={isLoading}>
                        <SelectTrigger className="flex-grow">
                            <SelectValue placeholder={isLoading ? "טוען תבניות..." : "בחר תבנית תקן"} />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                            {templates?.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAssign} disabled={isSubmitting || !selectedTemplateId}>
                        {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : <FileText  className="ml-2 h-4 w-4" />}
                        {isSubmitting ? "..." : (currentTemplateId ? "שנה שיוך" : "שייך תבנית")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function BattalionLoading() {
    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-10 w-36" />
            </div>
             <Skeleton className="h-32 w-full" />
             <Skeleton className="h-64 w-full" />
        </div>
    )
}

export default function BattalionPage() {
  const params = useParams();
  const firestore = useFirestore();
  const { user } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [brigadeId, setBrigadeId] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
        if (user) {
            const tokenResult = await user.getIdTokenResult(true);
            const claims = tokenResult.claims;
            setUserRole(claims.role || 'brigade'); // default to brigade if no role
            if (claims.role === 'battalion') {
                setBrigadeId(claims.brigadeId);
            } else {
                setBrigadeId(user.uid);
            }
        }
    };
    checkUserRole();
  }, [user]);

  const battalionId = params.battalionId as string;

  const battalionRef = useMemoFirebase(() => {
    if (!firestore || !brigadeId || !battalionId) return null;
    return doc(firestore, 'brigades', brigadeId, 'battalions', battalionId);
  }, [firestore, brigadeId, battalionId]);

  const { data: battalion, isLoading, error } = useDoc<Battalion>(battalionRef);

  if (isLoading || !battalion || !brigadeId || !userRole) {
    return <BattalionLoading />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center flex flex-col items-center justify-center h-full" dir="rtl">
          <ShieldAlert className="mx-auto h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">אירעה שגיאה</h2>
        <p>לא ניתן היה לטעון את נתוני הגדוד.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    )
  }

  const isBrigadeAdmin = userRole === 'admin' || userRole === 'brigade';

  return (
    <div className="space-y-8 w-full" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="font-headline text-4xl font-extrabold tracking-tight">
                    ניהול גדוד: {battalion.name}
                </h1>
                 {isBrigadeAdmin && (
                    <Link href={`/dashboard`} className="text-sm text-primary hover:underline">
                        <div className='flex items-center'>
                            <ArrowRight className="ml-1 h-3 w-3" />
                            חזרה לסקירת חטיבה
                        </div>
                    </Link>
                )}
            </div>
            {isBrigadeAdmin && brigadeId && (
                <AddBattalionUserDialog brigadeId={brigadeId} battalionId={battalionId} battalionName={battalion.name} />
            )}
      </div>

      {isBrigadeAdmin && (
        <AssignTemplateCard brigadeId={brigadeId} battalionId={battalionId} currentTemplateId={battalion.templateId} />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-2xl">פלוגות הגדוד</CardTitle>
                <CardDescription>ניהול הפלוגות המשויכות לגדוד.</CardDescription>
            </div>
             {isBrigadeAdmin && brigadeId && <AddCompanyDialog brigadeId={brigadeId} battalionId={battalionId} />}
        </CardHeader>
        <CardContent>
            <CompaniesList brigadeId={brigadeId} battalionId={battalionId} />
        </CardContent>
      </Card>

    </div>
  );
}
