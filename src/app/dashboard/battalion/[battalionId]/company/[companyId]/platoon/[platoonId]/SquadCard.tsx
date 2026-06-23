
'use client';

import { Soldier, Squad } from '@/types/platoon'; // Reverted to alias
import { SoldierCard } from './SoldierCard';

interface SquadCardProps {
  squad: Squad;
}

export const SquadCard: React.FC<SquadCardProps> = ({ squad }) => {

  const renderTeam = (team: 'chod' | 'ratak' | 'cmd') => {
    return squad.soldiers
      .filter(s => s.team === team)
      .sort((a, b) => a.number - b.number)
      .map(soldier => <SoldierCard key={soldier.id} soldier={soldier} />);
  };

  return (
    <div className="squad-card bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700 mb-8 last:mb-0">
      <header className="squad-header bg-slate-900/70 p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-white">{squad.name}</h2>
            <p className="text-sm text-slate-400">מפקד: {squad.commanderName}</p>
        </div>
      </header>

      <div className="squad-body p-4">
        {/* Command Team */}
        <div className="team-grid-container mb-6">
            <h3 className="text-center text-slate-300 font-bold text-sm mb-3">חוליית פיקוד</h3>
            <div className="team-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {renderTeam('cmd')}
            </div>
        </div>
        
        <hr className="border-slate-700 my-6" />

        {/* Fire Teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="team-grid-container mb-6 md:mb-0">
                <h3 className="text-center text-slate-300 font-bold text-sm mb-3">חוליית חוד</h3>
                <div className="team-grid grid grid-cols-2 gap-4">
                    {renderTeam('chod')}
                </div>
            </div>

            <div className="team-grid-container">
                <h3 className="text-center text-slate-300 font-bold text-sm mb-3">חוליית רתק</h3>
                <div className="team-grid grid grid-cols-2 gap-4">
                    {renderTeam('ratak')}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
