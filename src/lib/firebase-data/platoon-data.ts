
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/config'; // Assuming you have a file that exports the firestore instance
import { Platoon, Squad, Soldier } from '@/types/platoon';

// Function to fetch platoon data
export async function getPlatoonData(platoonId: string): Promise<Platoon | null> {
  try {
    const platoonRef = doc(firestore, 'platoons', platoonId);
    const platoonSnap = await getDoc(platoonRef);

    if (!platoonSnap.exists()) {
      console.log('No such platoon!');
      return null;
    }

    const platoonData = platoonSnap.data() as Omit<Platoon, 'id' | 'squads'>;

    const squadsRef = collection(platoonRef, 'squads');
    const squadsSnap = await getDocs(squadsRef);

    const squads: Squad[] = await Promise.all(
      squadsSnap.docs.map(async (squadDoc) => {
        const squadData = squadDoc.data() as Omit<Squad, 'id' | 'soldiers'>;

        const soldiersRef = collection(squadDoc.ref, 'soldiers');
        const soldiersSnap = await getDocs(soldiersRef);

        const soldiers: Soldier[] = soldiersSnap.docs.map((soldierDoc) => ({
          ...(soldierDoc.data() as Omit<Soldier, 'id'>),
          id: soldierDoc.id,
        }));

        return {
          ...squadData,
          id: squadDoc.id,
          soldiers,
        };
      })
    );

    return {
      ...platoonData,
      id: platoonSnap.id,
      squads,
    };
  } catch (error) {
    console.error("Error fetching platoon data:", error);
    return null;
  }
}
