'use client';

import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, Users, PlusCircle, Loader, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SquadCard } from './SquadCard';
import { PlatoonDashboard } from './PlatoonDashboard';


interface Platoon {
  id: string;
  name: string;
}

export interface Soldier {
    id: string;
    name: string;
    role: string;
    fireteam: string;
    positionInTeam?: number;
    equipment?: string[];
    gap?: string;
    squadId: string;
}

export interface Squad {
    id: string;
    name: string;
    commanderName?: string;
    soldiers: Soldier[];
}

function AddSquadDialog({ brigadeId, battalionId, companyId, platoonId }: { brigadeId: string; battalionId: string, companyId: string, platoonId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [commanderName, setCommanderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({ variant: "destructive", title: "שגיאה", description: "יש למלא שם כיתה." });
      return;
    }
    setIsSubmitting(true);
    try {
      const squadsCollection = collection(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies', companyId, 'platoons', platoonId, 'squads');
      await addDoc(squadsCollection, {
        name,
        commanderName: commanderName || "טרם שויך",
        platoonId,
        companyId,
        battalionId,
        brigadeId,
      });
      toast({ title: "הצלחה", description: "הכיתה נוספה בהצלחה." });
      setName("");
      setCommanderName("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding squad:", error);
      toast({ variant: "destructive", title: "שגיאה", description: "אירעה שגיאה בהוספת הכיתה." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="ml-2" />
          הוסף כיתה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת כיתה חדשה</DialogTitle>
          <DialogDescription>
            הזן את פרטי הכיתה החדשה שברצונך להוסיף למחלקה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                שם הכיתה
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder='לדוגמה: כיתה א'
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commanderName" className="text-right">
                שם המ"כ
              </Label>
              <Input
                id="commanderName"
                value={commanderName}
                onChange={(e) => setCommanderName(e.target.value)}
                className="col-span-3"
                placeholder='(אופציונלי)'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin ml-2" /> : null}
              {isSubmitting ? 'מוסיף...' : 'הוסף כיתה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function SquadsListContainer({ brigadeId, battalionId, companyId, platoonId }: { brigadeId: string, battalionId: string, companyId: string, platoonId: string }) {
    const firestore = useFirestore();
    const [allSquadsWithSoldiers, setAllSquadsWithSoldiers] = useState<Squad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const platoonRef = useMemoFirebase(() => {
        if (!firestore || !brigadeId || !battalionId || !companyId || !platoonId) return null;
        return doc(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies', companyId, 'platoons', platoonId);
    }, [firestore, brigadeId, battalionId, companyId, platoonId]);
    const { data: platoon } = useDoc<Platoon>(platoonRef);

    useEffect(() => {
        if (!firestore || !platoonId) return;

        const squadsCollection = collection(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies', companyId, 'platoons', platoonId, 'squads');
        const unsubscribe = onSnapshot(squadsCollection, async (squadSnapshot) => {
             setIsLoading(true);
            try {
                const squads = squadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Omit<Squad, 'soldiers'>[];

                const allSoldiers: Soldier[] = [];
                const soldierPromises = squads.map(squad => {
                    const soldiersCollection = collection(squadsCollection, squad.id, 'soldiers');
                    return getDocs(soldiersCollection);
                });

                const soldierSnapshots = await Promise.all(soldierPromises);

                soldierSnapshots.forEach((soldierSnapshot, index) => {
                    const squadId = squads[index].id;
                    const squadSoldiers = soldierSnapshot.docs.map(doc => ({ id: doc.id, squadId, ...doc.data() } as Soldier));
                    allSoldiers.push(...squadSoldiers);
                });


                const squadsWithSoldiers = squads.map(squad => ({
                    ...squad,
                    soldiers: allSoldiers.filter(soldier => soldier.squadId === squad.id)
                }));
                
                setAllSquadsWithSoldiers(squadsWithSoldiers);

            } catch (e: any) {
                setError(e);
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [firestore, brigadeId, battalionId, companyId, platoonId]);
    
    if (error) {
        return <div className="text-red-500 text-center p-4">שגיאה בטעינת הכיתות והחיילים: {error.message}</div>
    }

    const allSoldiers = allSquadsWithSoldiers.flatMap(s => s.soldiers);

    return (
        <>
            {(isLoading || allSquadsWithSoldiers.length > 0) ? (
                <PlatoonDashboard
                    platoonName={platoon?.name || ''}
                    squads={allSquadsWithSoldiers}
                    soldiers={allSoldiers}
                    pathParams={{ brigadeId, battalionId, companyId, platoonId }}
                    isLoading={isLoading}
                />
            ) : (
                 <Card>
                    <CardHeader>
                        <CardTitle>ניהול כיתות</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                            <Users className="w-16 h-16 mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                אין עדיין כיתות במחלקה זו
                            </h3>
                            <p className="max-w-md mb-6">
                                התחל על ידי הוספת הכיתה הראשונה למחלקה.
                            </p>
                            <AddSquadDialog brigadeId={brigadeId} battalionId={battalionId} companyId={companyId} platoonId={platoonId} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    )
}

function PlatoonLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      <Skeleton className="h-9 w-64" />
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <Loader className="w-16 h-16 mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                טוען נתוני מחלקה...
                </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PlatoonPage() {
  const params = useParams();
  const { user } = useUser();

  const battalionId = params.battalionId as string;
  const companyId = params.companyId as string;
  const platoonId = params.platoonId as string;
  const brigadeId = user?.uid;

  if (!brigadeId) {
    return <PlatoonLoading />;
  }

  return (
    <div className="space-y-8 w-full" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href={`/dashboard/battalion/${battalionId}/company/${companyId}`} className="text-sm text-blue-400 hover:underline">
            <div className='flex items-center'>
             <ArrowRight className="ml-1 h-3 w-3" />
             חזרה לפלוגה
            </div>
          </Link>
        </div>
        <AddSquadDialog brigadeId={brigadeId} battalionId={battalionId} companyId={companyId} platoonId={platoonId} />
      </div>
      
      <SquadsListContainer brigadeId={brigadeId} battalionId={battalionId} companyId={companyId} platoonId={platoonId} />
    </div>
  );
}
