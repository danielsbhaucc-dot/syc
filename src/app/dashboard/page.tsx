'use client';

import { useState, useEffect } from "react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, getDoc, updateDoc, FieldValue, arrayUnion, arrayRemove } from "firebase/firestore"; // Added getDoc, updateDoc, FieldValue, arrayUnion, arrayRemove
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ShieldCheck, ShieldAlert, ShieldX, Package, ArrowRight, Loader, PlusCircle, TrendingUp } from "lucide-react";

interface Unit {
  id: string;
  name: string;
  commander?: string;
  status: 'Nominal' | 'Warning' | 'Critical';
  personnel: { assigned: number; authorized: number };
  equipment: { onHand: number; authorized: number };
  readiness: number;
}

interface BrigadeDoc {
  name: string;
  members: Record<string, string>; // Map of UID to role
}

// --- Status Visuals ---
const statusIcons: Record<Unit['status'], React.ReactNode> = {
  Nominal: <ShieldCheck className="h-5 w-5 text-success" />,
  Warning: <ShieldAlert className="h-5 w-5 text-warning" />,
  Critical: <ShieldX className="h-5 w-5 text-destructive" />,
};

const statusColors: Record<Unit['status'], string> = {
  Nominal: "border-success/20 bg-success/10 text-green-300",
  Warning: "border-warning/20 bg-warning/10 text-yellow-300",
  Critical: "border-destructive/20 bg-destructive/10 text-red-400",
};

const statusLabels: Record<Unit['status'], string> = {
  Nominal: 'תקין',
  Warning: 'אזהרה',
  Critical: 'קריטי',
};

// --- Reusable AddBattalionDialog ---
function AddBattalionDialog({ brigadeId }: { brigadeId: string }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
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
            // --- FIX START ---
            const newBattalionRef = doc(battalionsCollection); // Create a reference to get a new ID
            await setDoc(newBattalionRef, { // Use setDoc to write the document with the ID
                id: newBattalionRef.id, // Explicitly set the document ID in its data
                name,
                brigadeId,
                status: "Nominal",
                personnel: { assigned: 0, authorized: 100 },
                equipment: { onHand: 0, authorized: 100 },
                readiness: 0,
            });
            // --- FIX END ---
            toast({ title: "הצלחה", description: "הגדוד נוסף בהצלחה." });
            setName("");
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
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <PlusCircle className="ml-2 h-5 w-5" />
                    הוסף גדוד חדש
                </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">הוספת גדוד חדש</DialogTitle>
                    <DialogDescription>הזן את שם הגדוד החדש.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        <Label htmlFor="name" className="text-right mb-2 block">שם הגדוד</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: גדוד 101" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'הוסף'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Enhanced Loading Skeleton ---
function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse" dir="rtl">
            <Skeleton className="h-12 w-1/3 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
            </div>
            <Skeleton className="h-96 rounded-xl" />
        </div>
    );
}

// --- Main Dashboard Page Component ---
export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const isMobile = useMediaQuery("(max-width: 1024px)");
    const [isClient, setIsClient] = useState(false);
    const [brigadeId, setBrigadeId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const { toast } = useToast(); // Added toast hook

    useEffect(() => setIsClient(true), []);

    useEffect(() => {
        if (isUserLoading) return;
        if (user) {
            user.getIdTokenResult(true).then(tokenResult => {
                const claims = tokenResult.claims;
                if (claims.role === 'battalion') {
                    router.push(`/dashboard/battalion/${claims.battalionId}`);
                } else {
                    setUserRole(claims.role || 'admin');
                    setBrigadeId(user.uid); // Reverted line
                }
            });
        } else {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    // NEW useEffect for client-side brigade membership management
    useEffect(() => {
        if (!user || !firestore || !brigadeId || !userRole || userRole === 'battalion') {
            return;
        }

        const brigadeRef = doc(firestore, 'brigades', brigadeId);

        const checkAndSetBrigadeMembership = async () => {
            try {
                const brigadeSnap = await getDoc(brigadeRef);

                if (!brigadeSnap.exists()) {
                    // Brigade does not exist, create it and add current user as admin
                    await setDoc(brigadeRef, {
                        name: "החטיבה שלי", // Default name for a new brigade
                        members: {
                            [user.uid]: 'admin'
                        },
                        createdAt: new Date(),
                    });
                    toast({
                        title: "החטיבה נוצרה בהצלחה",
                        description: "יצרנו עבורך חטיבה חדשה והגדרנו אותך כמנהל.",
                    });
                } else {
                    // Brigade exists, check if user is a member
                    const brigadeData = brigadeSnap.data() as BrigadeDoc;
                    if (!brigadeData.members || !brigadeData.members[user.uid]) {
                        // User is not in members, add them as admin
                        await updateDoc(brigadeRef, {
                            [`members.${user.uid}`]: 'admin'
                        });
                        toast({
                            title: "הצטרפת לחטיבה בהצלחה",
                            description: "הוגדרת כמנהל בחטיבה זו.",
                        });
                    }
                }
            } catch (error) {
                console.error("Error ensuring brigade membership:", error);
                toast({
                    variant: "destructive",
                    title: "שגיאה בהגדרת הרשאות חטיבה",
                    description: "אירעה שגיאה בבדיקת או עדכון הרשאות החטיבה שלך.",
                });
            }
        };

        checkAndSetBrigadeMembership();
    }, [user, firestore, brigadeId, userRole, toast]); // Re-run when user, firestore, brigadeId, or userRole changes

    const battalionsQuery = useMemoFirebase(() =>
        (firestore && brigadeId) ? collection(firestore, 'brigades', brigadeId, 'battalions') : null,
        [firestore, brigadeId]
    );

    const { data: battalions, isLoading, error } = useCollection<Unit>(battalionsQuery);

    if (!isClient || isUserLoading || isLoading || !userRole || userRole === 'battalion' || !brigadeId) {
        return <DashboardLoading />;
    }

    if (error) {
        return <div className="text-destructive text-center p-8">שגיאה בטעינת הנתונים: {error.message}</div>;
    }

    const totalPersonnel = battalions?.reduce((acc, unit) => acc + (unit.personnel?.assigned || 0), 0) || 0;
    const totalEquipment = battalions?.reduce((acc, unit) => acc + (unit.equipment?.onHand || 0), 0) || 0;
    const overallReadiness = battalions && battalions.length > 0 ? battalions.reduce((acc, unit) => acc + (unit.readiness || 0), 0) / battalions.length : 0;
    const criticalAlerts = battalions?.filter(unit => unit.status === "Critical").length || 0;

    const renderBattalionCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {battalions?.map((unit) => (
                <Card key={unit.id} className={`transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${statusColors[unit.status].replace('bg-', 'bg-gradient-to-br from-').replace(' to-', ' to-black/20')}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-xl font-headline">
                            <span>{unit.name}</span>
                            <Badge variant="outline" className={`gap-2 text-base ${statusColors[unit.status]}`}>
                                {statusIcons[unit.status]} {statusLabels[unit.status]}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">כוח אדם</p>
                                <p className="text-2xl font-bold">{unit.personnel?.assigned || 0}<span className="text-base font-normal text-muted-foreground">/{unit.personnel?.authorized || 0}</span></p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">ציוד</p>
                                <p className="text-2xl font-bold">{unit.equipment?.onHand || 0}<span className="text-base font-normal text-muted-foreground">/{unit.equipment?.authorized || 0}</span></p>
                            </div>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-medium mb-1 text-center">מוכנות</p>
                            <div className="flex items-center gap-3">
                                <Progress value={unit.readiness} className="h-3" indicatorClassName={`bg-${unit.status === 'Nominal' ? 'success' : unit.status === 'Warning' ? 'warning' : 'destructive'}`} />
                                <span className="text-lg font-bold text-white">{unit.readiness}%</span>
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-4 pt-2 flex justify-end">
                        <Button asChild className="bg-white/10 hover:bg-white/20 text-white">
                            <Link href={`/dashboard/battalion/${unit.id}`}>פרטים <ArrowRight className="mr-2 h-4 w-4" /></Link>
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );

    const renderBattalionTable = () => (
        <Table>
            <TableHeader>
                <TableRow className="border-b-border/50 hover:bg-muted/10">
                    <TableHead className="text-lg">יחידה</TableHead>
                    <TableHead className="text-lg">סטטוס</TableHead>
                    <TableHead className="text-lg">כוח אדם</TableHead>
                    <TableHead className="text-lg">ציוד</TableHead>
                    <TableHead className="text-lg w-[200px]">מוכנות</TableHead>
                    <TableHead className="text-left text-lg w-[120px]">פעולות</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {battalions?.map((unit) => (
                    <TableRow key={unit.id} className="hover:bg-muted/30 font-medium">
                        <TableCell className="font-headline text-base">{unit.name}</TableCell>
                        <TableCell><Badge variant="outline" className={`gap-2 ${statusColors[unit.status]}`}>{statusIcons[unit.status]} {statusLabels[unit.status]}</Badge></TableCell>
                        <TableCell>{unit.personnel?.assigned || 0} / {unit.personnel?.authorized || 0}</TableCell>
                        <TableCell>{unit.equipment?.onHand || 0} / {unit.equipment?.authorized || 0}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Progress value={unit.readiness} className="h-2" indicatorClassName={`bg-${unit.status === 'Nominal' ? 'success' : unit.status === 'Warning' ? 'warning' : 'destructive'}`} />
                                <span className="text-sm text-muted-foreground">{unit.readiness}%</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-left">
                            <Button variant="ghost" size="icon" asChild><Link href={`/dashboard/battalion/${unit.id}`}><ArrowRight className="h-5 w-5 text-primary" /></Link></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderEmptyState = () => (
        <div className="text-center py-20 px-6 bg-card/50 rounded-xl border-2 border-dashed border-border">
            <Users className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-6 text-2xl font-headline">לא נמצאו גדודים</h3>
            <p className="mt-2 text-muted-foreground">התחל בהוספת הגדוד הראשון שלך כדי לנהל את הכוחות.</p>
            <div className="mt-8">
                {brigadeId && <AddBattalionDialog brigadeId={brigadeId} />}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 w-full" dir="rtl">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white">
                לוח מחוונים חטיבתי
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card className="card-glow-success">
                    <CardHeader><CardTitle className="text-base text-green-300">מוכנות כללית</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-5xl font-extrabold text-white">{overallReadiness.toFixed(1)}<span className="text-3xl text-green-300">%</span></p>
                        <p className="text-sm text-muted-foreground mt-1">ממוצע חטיבתי</p>
                    </CardContent>
                </Card>
                <Card className="card-glow-primary">
                    <CardHeader><CardTitle className="text-base text-blue-300">סך כל כוח אדם</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-5xl font-extrabold text-white">{totalPersonnel}</p>
                        <p className="text-sm text-muted-foreground mt-1">חיילים משובצים</p>
                    </CardContent>
                </Card>
                <Card className="card-glow-primary">
                    <CardHeader><CardTitle className="text-base text-blue-300">סך כל ציוד</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-5xl font-extrabold text-white">{totalEquipment.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">פריטים במלאי</p>
                    </CardContent>
                </Card>
                <Card className="card-glow-destructive">
                    <CardHeader><CardTitle className="text-base text-red-300">התראות קריטיות</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-5xl font-extrabold text-white">{criticalAlerts}</p>
                        <p className="text-sm text-muted-foreground mt-1">יחידות בטיפול מיידי</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">סקירת גדודים</CardTitle>
                    <CardDescription>סקירה מקיפה על סטטוס הגדודים בחטיבה</CardDescription>
                </CardHeader>
                <CardContent>
                    {!battalions || battalions.length === 0
                        ? renderEmptyState()
                        : isMobile ? renderBattalionCards() : renderBattalionTable()}
                </CardContent>
                {!(!battalions || battalions.length === 0) && (
                    <div className="p-4 border-t border-border/50 mt-4">
                        {brigadeId && <AddBattalionDialog brigadeId={brigadeId} />}
                    </div>
                )}
            </Card>
        </div>
    );
}