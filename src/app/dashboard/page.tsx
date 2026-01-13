'use client';

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Package,
  ArrowRight,
  Loader,
  PlusCircle,
  UserPlus,
} from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, DocumentData, addDoc, doc, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


// Define interfaces based on backend.json for type safety
interface Unit {
  id: string;
  name: string;
  commander?: string;
  status: 'Nominal' | 'Warning' | 'Critical';
  personnel: {
    assigned: number;
    authorized: number;
  };
  equipment: {
    onHand: number;
    authorized: number;
  };
  readiness: number;
}

const statusIcons: Record<Unit['status'], React.ReactNode> = {
  Nominal: <ShieldCheck className="h-4 w-4 text-green-500" />,
  Warning: <ShieldAlert className="h-4 w-4 text-yellow-500" />,
  Critical: <ShieldX className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<Unit['status'], string> = {
  Nominal: "bg-green-500/20 text-green-400 border-green-500/30",
  Warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

function AddBattalionUserDialog({ brigadeId, battalionId, battalionName }: { brigadeId: string, battalionId: string, battalionName: string }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ variant: 'destructive', title: 'שגיאה', description: 'יש למלא אימייל וסיסמה.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, brigadeId, battalionId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create user');
            }

            toast({ title: 'הצלחה', description: `המשתמש נוצר והוקצה לגדוד ${battalionName}` });
            setEmail('');
            setPassword('');
            setOpen(false);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'שגיאה ביצירת משתמש', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="sm">
                    <UserPlus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
                <DialogHeader>
                    <DialogTitle>הוספת משתמש לגדוד: {battalionName}</DialogTitle>
                    <DialogDescription>
                        צור משתמש חדש שיקושר ישירות לגדוד זה. למשתמש זה תהיה גישה לנתוני הגדוד בלבד.
                    </DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email-user" className="text-right">
                            אימייל
                        </Label>
                        <Input
                            id="email-user"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            placeholder="user@example.com"
                        />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password-user" className="text-right">
                            סיסמה
                        </Label>
                        <Input
                            id="password-user"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="col-span-3"
                            placeholder="לפחות 6 תווים"
                        />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader className="animate-spin ml-2" /> : null}
                        {isSubmitting ? 'יוצר משתמש...' : 'צור והקצה משתמש'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


function DashboardLoading() {
  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 {[...Array(7)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function AddBattalionDialog({ brigadeId }: { brigadeId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({ variant: "destructive", title: "שגיאה", description: "יש למלא שם גדוד." });
      return;
    }
    setIsSubmitting(true);
    try {
      const battalionsCollection = collection(firestore, 'brigades', brigadeId, 'battalions');
      await addDoc(battalionsCollection, {
        name,
        brigadeId,
        location: location || "לא צוין",
        // Initialize with empty/default data
        status: "Nominal",
        personnel: { assigned: 0, authorized: 0 },
        equipment: { onHand: 0, authorized: 0 },
        readiness: 100,
      });
      toast({ title: "הצלחה", description: "הגדוד נוסף בהצלחה." });
      setName("");
      setLocation("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding battalion:", error);
      toast({ variant: "destructive", title: "שגיאה", description: "אירעה שגיאה בהוספת הגדוד." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all">
          <PlusCircle className="ml-2" />
          הוסף גדוד
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת גדוד חדש</DialogTitle>
          <DialogDescription>
            הזן את פרטי הגדוד החדש שברצונך להוסיף לחטיבה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                שם הגדוד
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="לדוגמה: גדוד 51"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                מיקום
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
                placeholder="(אופציונלי)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin ml-2" /> : null}
              {isSubmitting ? 'מוסיף...' : 'הוסף גדוד'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // The brigadeId is the user's UID.
  const brigadeId = user?.uid;
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
        if (user) {
            const tokenResult = await user.getIdTokenResult();
            const role = tokenResult.claims.role;
             if (role === 'battalion') {
                const battalionId = tokenResult.claims.battalionId;
                router.push(`/dashboard/battalion/${battalionId}`);
            } else {
                setUserRole(role || 'brigade');
            }
        }
    };
    checkUserRole();
  }, [user, router]);

  const battalionsQuery = useMemoFirebase(() => {
    if (!firestore || !brigadeId) return null;
    // Query for battalions that belong to the user's brigade
    return query(
      collection(firestore, 'brigades', brigadeId, 'battalions')
    );
  }, [firestore, brigadeId]);

  const { data: battalions, isLoading, error } = useCollection<Unit>(battalionsQuery);
  
  if (isLoading || !battalions || !userRole || userRole === 'battalion') {
    return <DashboardLoading />;
  }
  
  if (error) {
    return <div className="text-red-500">שגיאה בטעינת הנתונים: {error.message}</div>
  }

  const totalPersonnel = battalions.reduce(
    (acc, unit) => acc + (unit.personnel?.assigned || 0),
    0
  );
  const totalEquipment = battalions.reduce(
    (acc, unit) => acc + (unit.equipment?.onHand || 0),
    0
  );
  const overallReadiness =
    battalions.length > 0
      ? battalions.reduce((acc, unit) => acc + (unit.readiness || 0), 0) /
        battalions.length
      : 0;
  const criticalAlerts = battalions.filter(
    (unit) => unit.status === "Critical"
  ).length;

  return (
    <div className="space-y-8 w-full" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">
          לוח מחוונים חטיבתי
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              מוכנות כללית
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallReadiness.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              כלל הגדודים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך כל כוח אדם</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPersonnel}</div>
            <p className="text-xs text-muted-foreground">
              משובצים בכלל החטיבה
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך כל ציוד</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              פריטים במלאי
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-500/50 bg-red-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">התראות קריטיות</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{criticalAlerts}</div>
            <p className="text-xs text-red-400/80">
              יחידות הדורשות התייחסות מיידית
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center flex-row">
          <CardTitle>סקירת סטטוס גדודים</CardTitle>
          {brigadeId && <AddBattalionDialog brigadeId={brigadeId} />}
        </CardHeader>
        <CardContent>
          {battalions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-medium">לא נמצאו גדודים</h3>
              <p className="mt-1 text-sm">עדיין לא הוגדרו גדודים עבור חטיבה זו.</p>
              <div className="mt-6">
                {brigadeId && <AddBattalionDialog brigadeId={brigadeId} />}
              </div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">יחידה</TableHead>
                <TableHead>מפקד</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>כוח אדם (משובץ/תקן)</TableHead>
                <TableHead>ציוד (במלאי/תקן)</TableHead>
                <TableHead className="w-[150px]">מוכנות</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {battalions.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.commander || 'לא שויך'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`gap-2 ${statusColors[unit.status]}`}
                    >
                      {statusIcons[unit.status]}
                      {unit.status === 'Nominal' ? 'תקין' : unit.status === 'Warning' ? 'אזהרה' : 'קריטי'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {unit.personnel?.assigned || 0} / {unit.personnel?.authorized || 0}
                  </TableCell>
                  <TableCell>
                    {unit.equipment?.onHand || 0} / {unit.equipment?.authorized || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={unit.readiness} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {unit.readiness}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end">
                    {brigadeId && <AddBattalionUserDialog brigadeId={brigadeId} battalionId={unit.id} battalionName={unit.name} />}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/battalion/${unit.id}`}>
                        פרטים
                        <ArrowRight className="mr-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
