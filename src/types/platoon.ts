
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Defines the structure for a single soldier
export interface Soldier {
  id: string;
  name: string;
  role: string; // e.g., 'מוביל חוד', 'נגביסט'
  number: number; // Soldier's number in the squad
  iconName: string; // The string name of the icon from the API (e.g., 'faUserTie')
  icon?: IconDefinition; // The actual icon object, added on the client-side
  team: 'chod' | 'ratak' | 'cmd'; // Fireteam: Chod (Assault), Ratak (Support), Cmd (Command)
  theme: 'blue' | 'green' | 'orange' | 'red' | 'default';
  equipment: {
    assigned: string[]; // Equipment the soldier currently has
    required: string[]; // Equipment the soldier is supposed to have (the 'Teken')
    gaps?: string[]; // Automatically calculated field for missing equipment
  };
  status?: 'present' | 'missing' | 'on_leave'; // Soldier's current status
}

// Defines the structure for a squad
export interface Squad {
  id: string;
  name: string; // e.g., 'כיתה 1'
  commanderName: string;
  soldiers: Soldier[];
}

// Defines the top-level structure for the entire platoon dashboard
export interface Platoon {
  id: string;
  name: string; // e.g., 'מחלקת חבלה'
  company: string; // e.g., 'פלוגת חוד'
  overview: {
      [key: string]: string[]; // For the header stats like weapons, optics, etc.
  };
  squads: Squad[];
}
