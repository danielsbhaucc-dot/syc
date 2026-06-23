
import {
    IconDefinition,
    faUserTie, faUserShield, faWalkieTalkie, faUserNurse, faBomb, faUserSlash,
    faPersonRifle, faPersonRays, faUserCircle, faCrosshairs, faKitMedical
} from '@fortawesome/free-solid-svg-icons';

// This object maps string names to the actual Font Awesome icon objects.
// This is useful because we can store the string name (e.g., 'faUserTie') in our database
// and then use this map to find the correct icon object to render in the frontend.
const iconMap: { [key: string]: IconDefinition } = {
    faUserTie,
    faUserShield,
    faWalkieTalkie,
    faUserNurse,
    faBomb,
    faUserSlash,
    faPersonRifle,
    faPersonRays,
    faUserCircle,
    faCrosshairs,
    faKitMedical
};

/**
 * Returns the Font Awesome icon definition for a given name.
 * @param iconName - The string name of the icon (e.g., 'faUserTie').
 * @returns The IconDefinition object or a default icon if not found.
 */
export function getIconByName(iconName: string): IconDefinition {
    return iconMap[iconName] || faUserSlash; // Return a default/fallback icon
}
