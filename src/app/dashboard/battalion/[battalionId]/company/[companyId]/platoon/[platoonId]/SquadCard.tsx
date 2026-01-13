'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SoldierCard } from './SoldierCard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Squad } from './page';
import { Loader, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface PathParams {
    brigadeId: string;
    battalionId: string;
    companyId: string;
    platoonId: string;
}

export interface Soldier {
    id: string;
    name: string;
    role: string;
    fireteam: 'chod' | 'ratak' | 'cmd' | 'hq';
    positionInTeam?: number;
    equipment?: string[];
    gap?: string;
}

const fireteamNames = {
    chod: 'חוליה 1 - חוד',
    ratak: 'חוליה 2 - רתק',
    cmd: 'חוליה 3 - פיקוד וסגירה',
    hq: 'חפ"ק'
};

const fireteamColors = {
    chod: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ratak: 'bg-green-500/20 text-green-400 border-green-500/30',
    cmd: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    hq: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
}


function AddSoldierDialog({ squadId, pathParams }: { squadId: string; pathParams: PathParams }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [fireteam, setFireteam] = useState<Soldier['fireteam'] | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !fireteam) {
      toast({ variant: "destructive", title: "שגיאה", description: "יש למלא את כל השדות." });
      return;
    }
    setIsSubmitting(true);
    try {
      const soldiersCollection = collection(firestore, 'brigades', pathParams.brigadeId, 'battalions', pathParams.battalionId, 'companies', pathParams.companyId, 'platoons', pathParams.platoonId, 'squads', squadId, 'soldiers');
      await addDoc(soldiersCollection, {
        name,
        role,
        fireteam,
        equipment: [],
        squadId,
        ...pathParams,
      });
      toast({ title: "הצלחה", description: "החייל נוסף בהצלחה." });
      setName("");
      setRole("");
      setFireteam(undefined);
      setOpen(false);
    } catch (error) {
      console.error("Error adding soldier:", error);
      toast({ variant: "destructive", title: "שגיאה", description: "אירעה שגיאה בהוספת החייל." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
         <Button variant="outline" size="sm">
            <UserPlus className="ml-2 h-4 w-4" />
            הוסף חייל
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת חייל חדש</DialogTitle>
          <DialogDescription>
            הזן את פרטי החייל שברצונך להוסיף לכיתה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                שם החייל
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                תפקיד
              </Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} className="col-span-3" placeholder='לדוגמה: נגביסט' />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fireteam" className="text-right">חוליה</Label>
                 <Select value={fireteam} onValueChange={(value) => setFireteam(value as Soldier['fireteam'])}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="בחר חוליה" />
                    </SelectTrigger>
                    <SelectContent dir='rtl'>
                        {Object.entries(fireteamNames).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin ml-2" /> : null}
              {isSubmitting ? 'מוסיף...' : 'הוסף חייל'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export function SquadCard({ squad, pathParams }: { squad: Squad, pathParams: PathParams }) {
    const firestore = useFirestore();

    const soldiersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'brigades', pathParams.brigadeId, 'battalions', pathParams.battalionId, 'companies', pathParams.companyId, 'platoons', pathParams.platoonId, 'squads', squad.id, 'soldiers');
    }, [firestore, pathParams, squad.id]);

    const { data: soldiers, isLoading, error } = useCollection<Soldier>(soldiersQuery);

    const fireteams = {
        chod: soldiers?.filter(s => s.fireteam === 'chod') || [],
        ratak: soldiers?.filter(s => s.fireteam === 'ratak') || [],
        cmd: soldiers?.filter(s => s.fireteam === 'cmd') || [],
        hq: soldiers?.filter(s => s.fireteam === 'hq') || [],
    };
    
    const hasHq = fireteams.hq.length > 0;
    const gridCols = hasHq ? 'xl:grid-cols-2' : 'xl:grid-cols-3';

    return (
        <div className="relative mb-10 rounded-2xl border border-border bg-card p-6 pt-10 shadow-lg">
            <div className="absolute -top-4 right-6 bg-primary text-primary-foreground px-4 py-1 rounded-lg text-lg font-bold shadow-md">
                {squad.name} (מ"כ: {squad.commanderName})
            </div>

            <div className='absolute top-4 left-4'>
                <AddSoldierDialog squadId={squad.id} pathParams={pathParams} />
            </div>

            {isLoading && <div><Loader className="mx-auto animate-spin" /></div>}
            {error && <div className="text-red-500 text-center">שגיאה בטעינת חיילים: {error.message}</div>}

            {soldiers && soldiers.length === 0 && !isLoading && (
                 <div className="text-center py-10 text-muted-foreground">
                    <h3 className="text-lg font-medium">אין חיילים בכיתה זו</h3>
                    <p className="mt-1 text-sm">התחל על ידי הוספת החייל הראשון לכיתה.</p>
                </div>
            )}
            
            <div className={`grid grid-cols-1 ${gridCols} gap-6 mt-4`}>
               {Object.entries(fireteams).map(([key, teamSoldiers]) => {
                 if (teamSoldiers.length === 0) return null;
                 const teamKey = key as keyof typeof fireteamNames;

                 return (
                    <div key={key} className="flex flex-col gap-4 rounded-lg border border-border bg-background/50 p-4">
                        <div className={`inline-block self-start text-sm font-bold px-3 py-1 rounded ${fireteamColors[teamKey]}`}>
                            {fireteamNames[teamKey]}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {teamSoldiers.map(soldier => <SoldierCard key={soldier.id} soldier={soldier} />)}
                        </div>
                    </div>
                 )
               })}
            </div>
        </div>
    );
}

