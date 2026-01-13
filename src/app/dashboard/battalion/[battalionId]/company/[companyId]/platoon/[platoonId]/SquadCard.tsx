'use client';
import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';

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
    fireteam: string;
    positionInTeam?: number;
    equipment?: string[];
    gap?: string;
}

const fireteamColors: { [key: string]: string } = {
    chod: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ratak: 'bg-green-500/20 text-green-400 border-green-500/30',
    cmd: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    hq: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const getFireteamColor = (fireteam: string) => {
    const key = fireteam.toLowerCase();
    if (key in fireteamColors) return fireteamColors[key];
    return fireteamColors.default;
}

function AddSoldierDialog({ squadId, pathParams, existingFireteams }: { squadId: string; pathParams: PathParams, existingFireteams: string[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [fireteam, setFireteam] = useState<string | undefined>();
  const [positionInTeam, setPositionInTeam] = useState("");
  const [equipment, setEquipment] = useState("");
  const [gap, setGap] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const resetForm = () => {
    setName("");
    setRole("");
    setFireteam(undefined);
    setPositionInTeam("");
    setEquipment("");
    setGap("");
    setOpen(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !fireteam) {
      toast({ variant: "destructive", title: "שגיאה", description: "יש למלא שם, תפקיד וחוליה." });
      return;
    }
    setIsSubmitting(true);
    try {
      const soldiersCollection = collection(firestore, 'brigades', pathParams.brigadeId, 'battalions', pathParams.battalionId, 'companies', pathParams.companyId, 'platoons', pathParams.platoonId, 'squads', squadId, 'soldiers');
      await addDoc(soldiersCollection, {
        name,
        role,
        fireteam,
        positionInTeam: positionInTeam ? parseInt(positionInTeam) : null,
        equipment: equipment.split(',').map(s => s.trim()).filter(Boolean),
        gap: gap || null,
        squadId,
        ...pathParams,
      });
      toast({ title: "הצלחה", description: "החייל נוסף בהצלחה." });
      resetForm();
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
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת חייל חדש</DialogTitle>
          <DialogDescription>
            הזן את פרטי החייל שברצונך להוסיף לכיתה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
                 <Select value={fireteam} onValueChange={(value) => setFireteam(value)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="בחר חוליה" />
                    </SelectTrigger>
                    <SelectContent dir='rtl'>
                        {existingFireteams.map((ft) => (
                            <SelectItem key={ft} value={ft}>{ft}</SelectItem>
                        ))}
                         <SelectItem value="chod">חוליה 1 - חוד</SelectItem>
                         <SelectItem value="ratak">חוליה 2 - רתק</SelectItem>
                         <SelectItem value="cmd">חוליה 3 - פיקוד וסגירה</SelectItem>
                         <SelectItem value="hq">חפ"ק</SelectItem>
                         <SelectItem value="sabotage">חוליית חבלה</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                מספר בחוליה
              </Label>
              <Input id="position" type="number" value={positionInTeam} onChange={(e) => setPositionInTeam(e.target.value)} className="col-span-3" placeholder='(אופציונלי)' />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equipment" className="text-right">
                ציוד
              </Label>
              <Textarea id="equipment" value={equipment} onChange={(e) => setEquipment(e.target.value)} className="col-span-3" placeholder='הזן פריטים מופרדים בפסיק, לדוגמה: M4, כוונת M5, לדרמן'/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gap" className="text-right">
                פער
              </Label>
              <Input id="gap" value={gap} onChange={(e) => setGap(e.target.value)} className="col-span-3" placeholder='תיאור פער (אופציונלי)'/>
            </div>
          </div>
          <DialogFooter className="pt-4">
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

    const fireteams = React.useMemo(() => {
        if (!soldiers) return {};
        return soldiers.reduce((acc, soldier) => {
            const team = soldier.fireteam || 'ללא שיוך';
            if (!acc[team]) {
                acc[team] = [];
            }
            acc[team].push(soldier);
            return acc;
        }, {} as Record<string, Soldier[]>);
    }, [soldiers]);

    const existingFireteamNames = Object.keys(fireteams);
    
    const numTeams = existingFireteamNames.length;
    let gridColsClass = 'xl:grid-cols-3'; 
    if (numTeams === 1) gridColsClass = 'xl:grid-cols-1';
    if (numTeams === 2) gridColsClass = 'xl:grid-cols-2';
    if (numTeams >= 4) gridColsClass = 'xl:grid-cols-4';


    return (
        <div className="relative mb-10 rounded-2xl border border-border bg-card p-6 pt-10 shadow-lg">
            <div className="absolute -top-4 right-6 bg-primary text-primary-foreground px-4 py-1 rounded-lg text-lg font-bold shadow-md">
                {squad.name} (מ"כ: {squad.commanderName})
            </div>

            <div className='absolute top-4 left-4'>
                <AddSoldierDialog squadId={squad.id} pathParams={pathParams} existingFireteams={existingFireteamNames} />
            </div>

            {isLoading && <div><Loader className="mx-auto animate-spin" /></div>}
            {error && <div className="text-red-500 text-center">שגיאה בטעינת חיילים: {error.message}</div>}

            {soldiers && soldiers.length === 0 && !isLoading && (
                 <div className="text-center py-10 text-muted-foreground">
                    <h3 className="text-lg font-medium">אין חיילים בכיתה זו</h3>
                    <p className="mt-1 text-sm">התחל על ידי הוספת החייל הראשון לכיתה.</p>
                </div>
            )}
            
            <div className={`grid grid-cols-1 ${gridColsClass} gap-6 mt-4`}>
               {Object.entries(fireteams).map(([fireteamName, teamSoldiers]) => {
                 if (teamSoldiers.length === 0) return null;

                 return (
                    <div key={fireteamName} className="flex flex-col gap-4 rounded-lg border border-border bg-background/50 p-4">
                        <div className={`inline-block self-start text-sm font-bold px-3 py-1 rounded ${getFireteamColor(fireteamName)}`}>
                            {fireteamName}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {teamSoldiers
                                .sort((a, b) => (a.positionInTeam || 99) - (b.positionInTeam || 99))
                                .map(soldier => <SoldierCard key={soldier.id} soldier={soldier} />)
                            }
                        </div>
                    </div>
                 )
               })}
            </div>
        </div>
    );
}
