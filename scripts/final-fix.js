
// scripts/final-fix.js
const admin = require('firebase-admin');

try {
  admin.initializeApp();
} catch (e) {
  console.error('Could not initialize Firebase Admin SDK.');
  process.exit(1);
}

const firestore = admin.firestore();

async function fixBattalionIds() {
  console.log('--- Starting Final Fix Script ---');
  const brigadesSnapshot = await firestore.collection('brigades').get();
  let battalionsUpdated = 0;
  let brigadesScanned = 0;
  let totalBattalionsScanned = 0;

  if (brigadesSnapshot.empty) {
    console.log('No brigades found. Nothing to fix.');
    return;
  }

  console.log(`Found ${brigadesSnapshot.docs.length} brigades to scan.`);

  for (const brigadeDoc of brigadesSnapshot.docs) {
    brigadesScanned++;
    const brigadeName = brigadeDoc.data().name || brigadeDoc.id;
    
    const battalionsCollection = brigadeDoc.ref.collection('battalions');
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
        console.log(`Fixing battalion: ${battalionDoc.id} in brigade: ${brigadeName}`);
        batch.update(battalionDoc.ref, { id: battalionDoc.id });
        battalionsUpdated++;
        updatesInBatch++;
      }
    });

    if (updatesInBatch > 0) {
      await batch.commit();
    }
  }

  console.log('\n--- Fix Complete ---');
  console.log(`Scanned ${brigadesScanned} brigades and ${totalBattalionsScanned} total battalions.`);
  if (battalionsUpdated === 0) {
    console.log('Result: All battalion documents were already correct. No changes made.');
  } else {
    console.log(`Result: Successfully fixed and updated ${battalionsUpdated} battalion documents.`);
  }
  console.log('The database is now consistent. You can now view the battalions in the app.');
  console.log('--------------------');
}

fixBattalionIds().catch((error) => {
  console.error('\n--- SCRIPT FAILED ---');
  console.error('An unexpected error occurred:', error);
  console.error('--------------------');
});
