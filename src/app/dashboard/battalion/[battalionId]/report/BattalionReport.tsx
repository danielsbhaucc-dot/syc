
'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// --- Type Definitions (based on new HTML structure) ---
interface Soldier {
    id: number | string;
    name: string;
    role: string;
    icon: string;
    team: string;
    items: string[];
    gap?: string;
}

interface Squad {
    id: number | string;
    commander: string;
    soldiers: Soldier[];
}

interface ReportData {
    platoonName: string;
    companyName: string;
    headerStats: { [key: string]: string };
    hqSquad: { // חפ"ק + חוליית חבלה
        commander: any;
        sergeant: any;
        comms: any;
        medic: any;
        sappers: any[]; // חבלנים
    };
    squads: Squad[];
}

// --- Main Report Component ---
export default function BattalionReport({ battalionId }: { battalionId: string }) {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/battalion/${battalionId}/report`);
                if (!response.ok) throw new Error('Failed to fetch report data.');
                const result = await response.json();
                setData(result);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [battalionId]);

    if (loading) return <ReportSkeleton />;
    if (error) return <div dir="rtl" className="text-red-500 text-center p-8">שגיאה בטעינת הדוח: {error}</div>;
    if (!data) return <div dir="rtl">לא נמצאו נתונים להצגה.</div>;

    return <ReportView data={data} />;
}

// --- Main Display Component (ReportView) ---
const ReportView = ({ data }: { data: ReportData }) => {
    const { platoonName, companyName, headerStats, hqSquad, squads } = data;

    return (
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8" dir="rtl">
            <DashboardHeader platoonName={platoonName} companyName={companyName} stats={headerStats} />
            <HqSection hqSquad={hqSquad} />
            {squads.map(squad => <SquadSection key={squad.id} squad={squad} />)}
        </div>
    );
};


// --- Sub-components for ReportView ---

const DashboardHeader = ({ platoonName, companyName, stats }: any) => (
    <header className="bg-[#1e293b] border-b-4 border-[#3b82f6] p-5 rounded-2xl mb-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-3">
            <h1 className="text-3xl font-black text-white italic tracking-tighter">{platoonName}</h1>
            <p className="text-blue-400 font-bold mt-1">{companyName} | תמונת מצב אמת</p>
        </div>
        <div className="lg:col-span-9 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center divide-x divide-x-reverse divide-slate-700">
                <StatBox title="נשק מחלקתי" lines={[stats.weapons_m4, stats.weapons_negev]} />
                <StatBox title="אופטיקה" lines={[stats.optics_m5, stats.optics_lior]} colors={["text-red-400", "text-orange-400"]} />
                <StatBox title="תקשוב" lines={[stats.comms_624, stats.comms_710]} colors={["text-green-400", "text-green-400"]} />
                <StatBox title="אמצעים מיוחדים" lines={[stats.special_launcher, stats.special_rockets]} colors={["text-blue-400", "text-blue-400"]} />
                <StatBox title="ציוד פרט" lines={[stats.personal_knives, stats.personal_headlights]} colors={["text-red-500", "text-green-500"]} />
            </div>
        </div>
    </header>
);

const StatBox = ({ title, lines, colors = [] }: { title: string, lines: string[], colors?: string[] }) => (
    <div>
        <span className="text-[10px] text-slate-400 font-bold uppercase block">{title}</span>
        {lines.map((line, index) => (
            <div key={index} className={`text-sm font-bold ${colors[index] || 'text-white'}`}>{line}</div>
        ))}
    </div>
);

const HqSection = ({ hqSquad }: { hqSquad: ReportData['hqSquad'] }) => (
    <div className="bg-[#1e293b] border border-slate-600 rounded-2xl p-6 mb-10 relative">
        <div className="absolute -top-4 right-8 bg-slate-700 text-white py-1 px-5 rounded-lg font-extrabold text-lg shadow-md border-2 border-slate-600">
            חפ"ק מ"מ + חוליית חבלה
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
             {/* Command Team */}
             <div className="bg-[rgba(15,23,42,0.5)] border border-slate-700 rounded-xl p-4">
                <span className="text-sm font-bold uppercase text-slate-400 mb-4 block px-2">חוליית פיקוד ושליטה</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <SoldierCardHq soldier={hqSquad.commander} theme="blue" number={1} />
                    <SoldierCardHq soldier={hqSquad.sergeant} theme="blue" number={2} />
                    <SoldierCardHq soldier={hqSquad.comms} theme="gray" number={3} />
                    <SoldierCardHq soldier={hqSquad.medic} theme="red" number={4} />
                </div>
            </div>
             {/* Sapper Team */}
            <div className="bg-[rgba(15,23,42,0.5)] border border-orange-800/50 rounded-xl p-4">
                <span className="text-sm font-bold uppercase text-orange-400 mb-4 block px-2">חוליית חבלה מקצועית</span>
                <div className="grid grid-cols-2 gap-4">
                    {hqSquad.sappers.map((sapper, index) => (
                         <SoldierCardHq key={index} soldier={sapper} theme="orange" number={5 + index} />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const SoldierCardHq = ({ soldier, theme, number }: { soldier: any, theme: string, number: number }) => {
    if (!soldier) return null; 

    const themeClasses: { [key: string]: { text: string, icon: string, border: string, bg: string, num_bg: string, num_border: string } } = {
        blue: { text: 'text-blue-400', icon: 'text-blue-500', border: 'border-blue-500', bg: '', num_bg: 'bg-slate-700', num_border: 'border-slate-500' },
        red: { text: 'text-red-400', icon: 'text-red-500', border: 'border-red-500', bg: soldier.name ? '' : 'bg-red-900/20 border-dashed', num_bg: 'bg-red-800', num_border: 'border-red-500' },
        orange: { text: 'text-orange-400', icon: 'text-orange-500', border: 'border-orange-600', bg: soldier.name ? '' : 'bg-red-900/20 border-dashed', num_bg: 'bg-orange-800', num_border: 'border-orange-600' },
        gray: { text: 'text-slate-300', icon: 'text-slate-400', border: 'border-slate-600', bg: '', num_bg: 'bg-slate-700', num_border: 'border-slate-500' }
    };
    const currentTheme = themeClasses[theme];
    const isMissing = !soldier.name;

    return (
        <div className={`bg-[#0f172a] border rounded-lg p-3 flex flex-col items-center min-h-[220px] transition-transform hover:translate-y-[-5px] shadow-md ${currentTheme.border} ${currentTheme.bg}`}>
            <div className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs border ${currentTheme.num_bg} ${currentTheme.num_border}`}>{number}</div>
            <i className={`fas ${isMissing ? 'fa-user-slash opacity-50' : soldier.icon} text-3xl mt-4 mb-2 ${isMissing ? 'text-red-500' : currentTheme.icon}`}></i>
            <div className={`font-extrabold text-center leading-tight ${isMissing ? 'text-red-500' : currentTheme.text}`} dangerouslySetInnerHTML={{ __html: soldier.role.replace(/\n/g, '<br/>') }} />
            <div className={`text-slate-400 text-sm mb-2 font-semibold ${isMissing ? 'italic' : ''}`}>{soldier.name || '--'}</div>
            <div className="flex-grow w-full flex items-center justify-center mt-2">
                <div className="flex flex-wrap gap-1 justify-center">
                    {soldier.items?.map((item: string) => <span key={item} className={`bg-[#1e293b] border border-slate-500 text-slate-300 text-xs px-2 py-0.5 rounded-full`}>{item}</span>)}
                </div>
            </div>
            {soldier.gap && (
                <div className="mt-2 bg-red-900/50 border border-red-700 text-red-300 text-xs font-bold px-2 py-1 w-full text-center rounded">
                    <i className="fas fa-exclamation-triangle mr-1"></i> {soldier.gap}
                </div>
            )}
        </div>
    );
}

const SquadSection = ({ squad }: { squad: Squad }) => {
    const teams = {
        chod: squad.soldiers.filter(s => s.team === 'chod'),
        ratak: squad.soldiers.filter(s => s.team === 'ratak'),
        cmd: squad.soldiers.filter(s => s.team === 'cmd'),
    };

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 mb-10 relative">
            <div className="absolute -top-4 right-8 bg-blue-600 text-white py-1 px-5 rounded-lg font-extrabold text-lg shadow-md border-2 border-slate-900">
                כיתה {squad.id} (מ"כ: {squad.commander})
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
                <FireTeam teamName="חוליה 1 - חוד" teamData={teams.chod} theme="blue" />
                <FireTeam teamName="חוליה 2 - רתק" teamData={teams.ratak} theme="green" />
                <FireTeam teamName="חוליה 3 - פיקוד וסגירה" teamData={teams.cmd} theme="gray" wide={true} />
            </div>
        </div>
    );
}

const FireTeam = ({ teamName, teamData, theme, wide = false }: { teamName: string, teamData: Soldier[], theme: string, wide?: boolean }) => (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
        <span className={`text-sm font-bold uppercase mb-4 block px-2 text-${theme}-400`}>{teamName}</span>
        <div className={`grid grid-cols-2 ${wide ? 'lg:grid-cols-4 xl:grid-cols-2' : ''} gap-3`}>
            {teamData.map(soldier => <SoldierCard key={soldier.id} soldier={soldier} />)}
        </div>
    </div>
);

const SoldierCard = ({ soldier }: { soldier: Soldier }) => {
    const getTheme = () => {
        if (soldier.role.includes("מפקד")) return 'yellow';
        if (soldier.role.includes("מע\"ר")) return 'red';
        if (soldier.team === 'chod') return 'blue';
        if (soldier.team === 'ratak') return 'emerald';
        return 'slate';
    };
    const theme = getTheme();

    return (
        <div className="bg-[#0f172a] border border-slate-600 rounded-lg p-3 flex flex-col items-center min-h-[220px] transition-transform hover:translate-y-[-5px] hover:border-primary shadow-md">
            <div className="absolute top-2 right-2 bg-slate-700 text-white w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs border border-slate-500">{soldier.id}</div>
            <i className={`fas ${soldier.icon} text-3xl mt-4 mb-2 text-${theme}-500`}></i>
            <div className={`font-bold text-center text-${theme}-400`}>{soldier.role}</div>
            <div className="text-slate-400 text-sm mb-2 font-semibold">{soldier.name}</div>
            <div className="flex-grow w-full flex items-center justify-center mt-2">
                <div className="flex flex-wrap gap-1 justify-center">
                    {soldier.items.map(item => <span key={item} className="bg-[#1e293b] border border-slate-500 text-slate-300 text-xs px-2 py-0.5 rounded-full">{item}</span>)}
                </div>
            </div>
            {soldier.gap && (
                <div className="mt-2 bg-red-900/50 border border-red-700 text-red-300 text-xs font-bold px-2 py-1 w-full text-center rounded">
                    <i className="fas fa-exclamation-triangle mr-1"></i> {soldier.gap}
                </div>
            )}
        </div>
    );
};


const ReportSkeleton = () => (
    <div dir="rtl" className="space-y-8 p-4 md:p-8">
        <Skeleton className="h-32 w-full rounded-2xl bg-slate-800" />
        <Skeleton className="h-64 w-full rounded-2xl bg-slate-800" />
        <Skeleton className="h-96 w-full rounded-2xl bg-slate-800" />
    </div>
);
