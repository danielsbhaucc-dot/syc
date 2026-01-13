'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, DocumentData, collection, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MapPin, ShieldAlert, PlusCircle, Loader, ArrowRight, FileText, UserCheck, UserPlus, FileWarning } from 'lucide-react';
import { useState } from 'react';
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

interface Template {
    id: string;
    name: string;
}

interface Role {
  id: string;
  name: string;
}

interface Personnel {
    id: string;
    name: string;
    roleId: string;
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
            </CardHeader>
            <CardContent className="space-y-4">
                {currentTemplateId && (
                    <div className="text-sm p-3 bg-green-900/50 border border-green-700 rounded-md">
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
                        {isSubmitting ? <Loader className="animate-spin ml-2" /> : <FileText />}
                        {isSubmitting ? "משייך..." : (currentTemplateId ? "שנה שיוך" : "שייך תבנית")}
                    </Button>
                </div>
                 <p className="text-xs text-muted-foreground">
                    שיוך תבנית יגדיר את תקן כוח האדם והציוד עבור הגדוד. משתמש הגדוד יצטרך למלא את הנתונים בהתאם לתבנית זו.
                </p>
            </CardContent>
        </Card>
    )
}

function BattalionStructureView({ brigadeId, battalionId, templateId }: { brigadeId: string, battalionId: string, templateId: string }) {
    const firestore = useFirestore();

    const rolesQuery = useMemoFirebase(() => {
        return collection(firestore, 'brigades', brigadeId, 'templates', templateId, 'roles');
    }, [firestore, brigadeId, templateId]);
    
    const personnelQuery = useMemoFirebase(() => {
        return collection(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'personnel');
    }, [firestore, brigadeId, battalionId]);

    const { data: roles, isLoading: isLoadingRoles } = useCollection<Role>(rolesQuery);
    const { data: personnel, isLoading: isLoadingPersonnel } = useCollection<Personnel>(personnelQuery);

    if (isLoadingRoles || isLoadingPersonnel) {
        return <div>טוען תקן ושיבוצים...</div>;
    }

    // Map personnel to their roles for quick lookup
    const personnelByRole = personnel?.reduce((acc, p) => {
        if (!acc[p.roleId]) {
            acc[p.roleId] = [];
        }
        acc[p.roleId].push(p);
        return acc;
    }, {} as Record<string, Personnel[]>);


    return (
        <Card>
            <CardHeader>
                <CardTitle>תקן כוח אדם ושיבוצים</CardTitle>
                <CardDescription>
                    שבץ את אנשי הסגל שלך לתפקידים הנדרשים על פי התקן.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>תפקיד בתקן</TableHead>
                            <TableHead>איש סגל משובץ</TableHead>
                            <TableHead className="text-right">פעולות</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles?.map((role) => {
                            const assignedPersonnel = personnelByRole?.[role.id];
                            return (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell>
                                        {assignedPersonnel && assignedPersonnel.length > 0
                                            ? assignedPersonnel.map(p => p.name).join(', ')
                                            : <span className="text-yellow-400">לא משובץ</span>
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm"><UserCheck className="ml-2"/>שבץ איש סגל</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                 <div className="mt-4 flex justify-end">
                    <Button><UserPlus className="ml-2" />הוסף איש סגל חדש</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function BattalionLoading() {
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
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>פלוגות</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                        <Loader className="w-16 h-16 mb-4 animate-spin" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            טוען נתונים...
                        </h3>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function NoTemplateAssigned() {
    return (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400"><FileWarning /> לא שויכה תבנית</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-yellow-300/80">
                    כדי להתחיל לנהל את כוח האדם, יש לשייך תבנית תקן לגדוד זה.
                    <br/>
                    התבנית מגדירה את רשימת התפקידים הנדרשים בגדוד.
                </p>
                 <p className="text-xs text-muted-foreground mt-4">
                    פעולה זו מתבצעת על ידי מנהל החטיבה.
                </p>
            </CardContent>
        </Card>
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
      <div className="text-red-500 text-center" dir="rtl">
          <ShieldAlert className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">אירעה שגיאה</h2>
        <p>לא ניתן היה לטעון את נתוני הגדוד.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    )
  }

  const isBrigadeAdmin = userRole === 'admin' || userRole === 'brigade';

  return (
    <div className="space-y-8 w-full" dir="rtl">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-4xl font-bold tracking-tighter">
                    גדוד: {battalion.name}
                </h1>
                 {isBrigadeAdmin && (
                    <Link href={`/dashboard`} className="text-sm text-blue-400 hover:underline">
                        <div className='flex items-center'>
                            <ArrowRight className="ml-1 h-3 w-3" />
                            חזרה לחטיבה
                        </div>
                    </Link>
                )}
            </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי הגדוד</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-lg">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-muted-foreground" />
            <span className="font-medium">שם:</span>
            <span>{battalion.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-muted-foreground" />
            <span className="font-medium">מיקום:</span>
            <span>{battalion.location}</span>
          </div>
        </CardContent>
      </Card>

      {isBrigadeAdmin && (
        <AssignTemplateCard brigadeId={brigadeId} battalionId={battalionId} currentTemplateId={battalion.templateId} />
      )}

      {battalion.templateId ? (
         <BattalionStructureView brigadeId={brigadeId} battalionId={battalionId} templateId={battalion.templateId}/>
      ) : (
        <NoTemplateAssigned />
      )}
    </div>
  );
}

    