import { getAdminFirestore } from '@/firebase/admin';
import { Platoon, Squad, Soldier } from '@/types/platoon';

export async function getPlatoonData(platoonId: string): Promise<Platoon | null> {
  try {
    const firestore = getAdminFirestore();
    const platoonRef = firestore.collection('platoons').doc(platoonId);
    const platoonSnap = await platoonRef.get();

    if (!platoonSnap.exists) {
      console.log('No such platoon!');
      return null;
    }

    const platoonData = platoonSnap.data() as Omit<Platoon, 'id' | 'squads'>;

    const squadsSnap = await platoonRef.collection('squads').get();

    const squads: Squad[] = await Promise.all(
      squadsSnap.docs.map(async (squadDoc) => {
        const squadData = squadDoc.data() as Omit<Squad, 'id' | 'soldiers'>;

        const soldiersSnap = await squadDoc.ref.collection('soldiers').get();

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
