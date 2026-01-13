'use client';
import type { Soldier } from './SquadCard';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bomb, Cross, Crosshair, HeartPulse, ShieldQuestion, User, UserCog, UserCircle, PersonStanding, Shield, RadioTower, Box, PlusMedical } from 'lucide-react';


const roleIcons: { [key: string]: React.ReactNode } = {
    'מפקד': <UserCircle className="text-yellow-400" />,
    'מ"כ': <UserCircle className="text-yellow-400" />,
    'סמל': <Shield className="text-blue-400" />,
    'נגביסט': <Crosshair className="text-green-400" />,
    'חובש': <PlusMedical className="text-red-400" />,
    'קלע': <Crosshair className="text-green-400" />,
    'חבלן': <Bomb className="text-orange-400" />,
    'קשר': <RadioTower className="text-blue-400" />,
    'רובאי': <PersonStanding className="text-slate-400" />,
     default: <User className="text-slate-400" />,
};

const getRoleIcon = (role: string) => {
    const roleKey = Object.keys(roleIcons).find(key => role.toLowerCase().includes(key));
    return roleKey ? roleIcons[roleKey] : roleIcons.default;
}

export function SoldierCard({ soldier }: { soldier: Soldier }) {

    const hasGap = soldier.gap && soldier.gap.length > 0;

    return (
        <div className={`relative flex min-h-[220px] flex-col items-center rounded-xl border bg-card p-3 text-center shadow-lg transition-all hover:-translate-y-1 hover:border-primary/80 ${hasGap ? 'border-destructive/50' : 'border-border'}`}>
            <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold border border-slate-600">
                {soldier.positionInTeam || '?'}
            </div>
            
            <div className="mt-6 flex-shrink-0 size-10">
                {getRoleIcon(soldier.role)}
            </div>

            <div className="mt-2 flex-grow">
                <p className="font-extrabold text-base leading-tight">{soldier.role}</p>
                <p className="text-sm text-muted-foreground font-semibold">{soldier.name}</p>
            </div>

            {soldier.equipment && soldier.equipment.length > 0 && (
                 <div className="mt-auto flex w-full flex-wrap justify-center gap-1 py-2">
                    {soldier.equipment.map((item, i) => (
                         <TooltipProvider key={i} delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="cursor-default text-xs font-semibold">{item}</Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>{item}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            )}
            
            {hasGap && (
                 <div className="mt-2 w-full rounded-md border border-destructive/50 bg-destructive/20 px-2 py-1 text-xs font-bold text-red-400 animate-pulse">
                    {soldier.gap}
                </div>
            )}

        </div>
    );
}
