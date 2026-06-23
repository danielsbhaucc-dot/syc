
// src/app/api/migrate-ids/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/firebase/admin'; // Using the project's admin SDK instance

export async function GET(req: NextRequest) {
  const firestore = adminFirestore;
  let battalionsUpdated = 0;
  let brigadesScanned = 0;
  let totalBattalionsScanned = 0;
  const logs: string[] = [];

  try {
    logs.push('Starting migration script...');
    const brigadesSnapshot = await firestore.collection('brigades').get();

    if (brigadesSnapshot.empty) {
      logs.push('No brigades found. Nothing to process.');
      return NextResponse.json({ message: "No brigades found.", logs });
    }

    logs.push(`Found ${brigadesSnapshot.docs.length} brigades. Scanning...`);

    for (const brigadeDoc of brigadesSnapshot.docs) {
      brigadesScanned++;
      const brigadeId = brigadeDoc.id;
      const brigadeName = brigadeDoc.data().name || brigadeId;
      const battalionsCollection = firestore.collection('brigades').doc(brigadeId).collection('battalions');
      const battalionsSnapshot = await battalionsCollection.get();
      totalBattalionsScanned += battalionsSnapshot.docs.length;

      if (battalionsSnapshot.empty) {
        continue;
      }

      const batch = firestore.batch();
      let updatesInBatch = 0;

      battalionsSnapshot.docs.forEach((battalionDoc) => {
        const battalionData = battalionDoc.data();
        if (battalionData.id !== battalionDoc.id) {
          logs.push(`FIXING: Battalion document ${battalionDoc.id} in brigade ${brigadeName}. It was missing the correct 'id' field.`);
          batch.update(battalionDoc.ref, { id: battalionDoc.id });
          battalionsUpdated++;
          updatesInBatch++;
        }
      });

      if (updatesInBatch > 0) {
        await batch.commit();
        logs.push(`Committed ${updatesInBatch} updates for brigade ${brigadeName}.`);
      }
    }

    const summary = `Migration complete. Scanned ${brigadesScanned} brigades and ${totalBattalionsScanned} battalions. Fixed ${battalionsUpdated} documents.`;
    logs.push(summary);
    console.log(summary);
    
    return NextResponse.json({ 
      message: "Migration successful!", 
      summary, 
      details: {
        brigadesScanned,
        totalBattalionsScanned,
        battalionsUpdated,
      },
      logs 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Migration failed:", error);
    logs.push('--- SCRIPT FAILED ---');
    logs.push(errorMessage);
    return NextResponse.json({ message: "Migration failed", error: errorMessage, logs }, { status: 500 });
  }
}
