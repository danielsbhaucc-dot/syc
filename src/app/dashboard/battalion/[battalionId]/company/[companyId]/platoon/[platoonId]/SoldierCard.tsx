'use client';
import type { Soldier } from './SquadCard';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bomb, Cross, Crosshair, HeartPulse, ShieldQuestion, User, UserCog } from 'lucide-react';


const roleIcons: { [key: string]: React.ReactNode } = {
    'מפקד': <UserCog className="text-yellow-400" />,
    'נגביסט': <Crosshair className="text-green-400" />,
    'חובש': <HeartPulse className="text-red-400" />,
    'חבלן': <Bomb className="text-orange-400" />,
    'קשר': <ShieldQuestion className="text-blue-400" />,
     default: <User className="text-slate-400" />,
};

const getRoleIcon = (role: string) => {
    const roleKey = Object.keys(roleIcons).find(key => role.includes(key));
    return roleKey ? roleIcons[roleKey] : roleIcons.default;
}

export function SoldierCard({ soldier }: { soldier: Soldier }) {

    return (
        <div className="relative flex min-h-[160px] flex-col items-center rounded-lg border border-border bg-card p-3 text-center shadow-md transition-all hover:-translate-y-1 hover:border-primary/50">
            <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold">
                {soldier.positionInTeam || '?'}
            </div>
            
            <div className="mt-4 flex-shrink-0 size-8">
                {getRoleIcon(soldier.role)}
            </div>

            <div className="mt-2 flex-grow">
                <p className="font-bold leading-tight">{soldier.role}</p>
                <p className="text-sm text-muted-foreground">{soldier.name}</p>
            </div>

            {soldier.equipment && soldier.equipment.length > 0 && (
                <div className="mt-2 flex w-full flex-wrap justify-center gap-1">
                    {soldier.equipment.map((item, i) => (
                         <TooltipProvider key={i}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="secondary" className="text-xs">{item}</Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>{item}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            )}
            
            {soldier.gap && (
                 <div className="mt-2 w-full rounded border border-destructive/50 bg-destructive/20 px-2 py-1 text-xs font-bold text-red-400 animate-pulse">
                    {soldier.gap}
                </div>
            )}

        </div>
    );
}
