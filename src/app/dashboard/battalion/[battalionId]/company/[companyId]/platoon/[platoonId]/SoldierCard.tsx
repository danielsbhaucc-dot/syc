
import { cva, VariantProps } from 'class-variance-authority';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const cardVariants = cva(
  'soldier-card flex flex-col items-center min-h-[220px] bg-slate-900/50 border rounded-lg p-3 relative transition-all duration-300 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg',
  {
    variants: {
      theme: {
        default: 'border-slate-700 hover:border-blue-500',
        blue: 'border-blue-800 hover:border-blue-500',
        green: 'border-green-800 hover:border-green-500',
        orange: 'border-orange-800 hover:border-orange-500',
        red: 'border-red-800 hover:border-red-500',
      },
      hasGap: {
        true: 'border-dashed !border-red-500 bg-red-900/20',
        false: '',
      }
    },
    defaultVariants: {
      theme: 'default',
      hasGap: false
    },
  }
);

const roleTextVariants = cva('font-headline text-base text-center leading-tight', {
    variants: {
      theme: {
        default: 'text-slate-300',
        blue: 'text-blue-400',
        green: 'text-green-400',
        orange: 'text-orange-400',
        red: 'text-red-400',
      }
    },
    defaultVariants: {
        theme: 'default'
    }
})

const iconVariants = cva('text-3xl mb-2', {
    variants: {
      theme: {
        default: 'text-slate-400',
        blue: 'text-blue-500',
        green: 'text-green-500',
        orange: 'text-orange-500',
        red: 'text-red-500',
      }
    },
    defaultVariants: {
        theme: 'default'
    }
})


export interface Soldier {
    id: string;
    name: string;
    role: string;
    number: number;
    equipment: {
        assigned: string[];
        required: string[];
        gaps: string[];
    };
    icon: IconDefinition;
    theme: VariantProps<typeof cardVariants>['theme'];
}

interface SoldierCardProps extends VariantProps<typeof cardVariants> {
  soldier: Soldier;
}

export function SoldierCard({ soldier }: SoldierCardProps) {
    const hasGap = soldier.equipment.gaps.length > 0;

    return (
        <div className={cardVariants({ theme: soldier.theme, hasGap })}>
            <div className="soldier-num absolute top-2 right-2 bg-slate-700 text-white w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs border border-slate-600">
                {soldier.number}
            </div>
            <FontAwesomeIcon icon={soldier.icon} className={iconVariants({ theme: soldier.theme })} />
            
            <div className={roleTextVariants({ theme: soldier.theme })}>{soldier.role}</div>
            <div className="name-text text-slate-400 text-sm font-semibold mb-2">{soldier.name}</div>

            <div className="equipment-grid flex flex-wrap gap-1 justify-center w-full mt-auto">
                {soldier.equipment.assigned.map(item => (
                    <span key={item} className="eq-pill bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
                        {item}
                    </span>
                ))}
            </div>

            {hasGap && (
                <div className="gap-alert-box mt-2 bg-red-900/50 border border-red-700 text-red-300 text-xs p-1.5 w-full text-center rounded-md font-bold">
                    <p>פערים: {soldier.equipment.gaps.join(', ')}</p>
                </div>
            )}
        </div>
    );
}
