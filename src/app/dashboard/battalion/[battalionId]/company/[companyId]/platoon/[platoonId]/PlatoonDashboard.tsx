'use client';

import { useMemo } from 'react';
import type { Squad, Soldier } from './page';
import { SquadCard } from './SquadCard';
import { Loader } from 'lucide-react';

interface PlatoonDashboardProps {
  platoonName: string;
  squads: Squad[];
  soldiers: Soldier[];
  pathParams: {
    brigadeId: string;
    battalionId: string;
    companyId: string;
    platoonId: string;
  };
  isLoading: boolean;
}

// Helper function to count equipment
const countEquipment = (soldiers: Soldier[], itemName: string) => {
    return soldiers.reduce((count, soldier) => {
        return count + (soldier.equipment?.filter(e => e.toLowerCase().includes(itemName.toLowerCase())).length || 0);
    }, 0);
};

const getGapCount = (soldiers: Soldier[], itemName: string) => {
    return soldiers.reduce((count, soldier) => {
         return count + (soldier.gap?.toLowerCase().includes(itemName.toLowerCase()) ? 1 : 0);
    }, 0);
}


export function PlatoonDashboard({ platoonName, squads, soldiers, pathParams, isLoading }: PlatoonDashboardProps) {

  const stats = useMemo(() => {
    if (!soldiers || soldiers.length === 0) return {
        m4: 0, negev: 0, m5: 0, leor: 0, mk624: 0, mk710: 0, matol: 0, law: 0, matador: 0, ullarin: 0, panas: 0, totalSoldiers: 0, gaps: { leor: 0 }
    };
    const totalSoldiers = soldiers.length;
    const allSquadsSoldiers = squads.flatMap(s => s.soldiers || []);
    const kasharim = allSquadsSoldiers.filter(s => s.role.includes("קשר"));

    return {
        m4: countEquipment(soldiers, 'm4'),
        negev: countEquipment(soldiers, 'נגב'),
        m5: countEquipment(soldiers, 'm5'),
        leor: countEquipment(soldiers, 'ליאור'),
        mk624: countEquipment(soldiers, '624'),
        mk710: countEquipment(kasharim, '710'),
        matol: countEquipment(soldiers, 'מטול'),
        law: countEquipment(soldiers, 'לאו'),
        matador: countEquipment(soldiers, 'מטאדור'),
        ullarin: countEquipment(soldiers, 'לדרמן') + countEquipment(soldiers, 'אולר'),
        panas: countEquipment(soldiers, 'פנס'),
        totalSoldiers,
        gaps: {
            leor: getGapCount(soldiers, 'ליאור'),
        }
    };
  }, [soldiers, squads]);


  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-12">
        <Loader className="h-8 w-8 animate-spin" />
        <p className="mr-4 text-lg">טוען נתוני מחלקה...</p>
      </div>
    );
  }

  const leorTotal = countEquipment(soldiers, 'ליאור');
  const leorReady = leorTotal - stats.gaps.leor;

  return (
    <div className="w-full space-y-10">
       <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-slate-700 bg-[#1e293b] p-6 shadow-2xl">
         <div className="lg:col-span-3">
            <h1 className="text-3xl font-black text-white italic tracking-tighter">{platoonName}</h1>
            <p className="text-blue-400 font-bold mt-1">פלוגת חוד | תמונת מצב אמת</p>
        </div>

        <div className="lg:col-span-9 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center divide-x divide-x-reverse divide-slate-700">
                <div className="flex flex-col justify-center px-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">נשק מחלקתי</span>
                    <div className="text-sm font-bold text-white">{stats.m4} יח' M4</div>
                    <div className="text-sm font-bold text-emerald-400">{stats.negev} יח' נגב</div>
                </div>
                <div className="flex flex-col justify-center px-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">אופטיקה</span>
                    <div className={`text-sm font-bold ${stats.m5 === stats.totalSoldiers ? 'text-green-400' : 'text-red-400'}`}>{stats.m5}/{stats.totalSoldiers} כוונות M5</div>
                    <div className={`text-sm font-bold ${leorReady === leorTotal && leorTotal > 0 ? 'text-green-400' : (leorTotal > 0 ? 'text-orange-400' : 'text-white')}`}>{leorReady}/{leorTotal} ליאור</div>
                </div>
                <div className="flex flex-col justify-center px-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">תקשוב</span>
                    <div className="text-sm font-bold text-green-400">{stats.mk624} מ.ק 624</div>
                    <div className="text-sm font-bold text-green-400">{stats.mk710} מ.ק 710</div>
                </div>
                <div className="flex flex-col justify-center px-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">אמצעים מיוחדים</span>
                    <div className="text-sm font-bold text-blue-400">{stats.matol} מטול | {stats.law} לאו</div>
                    <div className="text-sm font-bold text-blue-400">{stats.matador} מטאדור</div>
                </div>
                 <div className="flex flex-col justify-center px-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">ציוד פרט</span>
                    <div className={`text-sm font-bold ${stats.ullarin >= stats.totalSoldiers ? 'text-green-500' : 'text-red-500'}`}>{stats.ullarin}/{stats.totalSoldiers} אולרים</div>
                    <div className={`text-sm font-bold ${stats.panas >= stats.totalSoldiers ? 'text-green-500' : 'text-red-500'}`}>{stats.panas}/{stats.totalSoldiers} פנסי ראש</div>
                </div>
            </div>
        </div>
      </header>

      <div className="space-y-8">
        {squads.map((squad) => (
          <SquadCard key={squad.id} squad={squad} pathParams={pathParams} />
        ))}
      </div>
    </div>
  );
}
