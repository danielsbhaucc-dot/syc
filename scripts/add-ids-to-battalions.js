
// scripts/add-ids-to-battalions.js

// This script iterates through all battalions in all brigades
// and adds a dedicated 'id' field to each, matching its document ID.
// This is a one-time migration script.

// To run this script, use the command:
// node scripts/add-ids-to-battalions.js

const { admin, app } = require('../src/firebase/admin-initialized');

const firestore = admin.firestore();

async function addBattalionIds() {
  console.log('Starting to add IDs to battalion documents...');

  try {
    const brigadesSnapshot = await firestore.collection('brigades').get();
    let battalionsUpdated = 0;

    if (brigadesSnapshot.empty) {
      console.log('No brigades found.');
      return;
    }

    await Promise.all(brigadesSnapshot.docs.map(async (brigadeDoc) => {
      const brigadeName = brigadeDoc.data().name || brigadeDoc.id;
      const battalionsCollection = brigadeDoc.ref.collection('battalions');
      const battalionsSnapshot = await battalionsCollection.get();

      if (battalionsSnapshot.empty) {
        console.log(`No battalions found in brigade: ${brigadeName}`);
        return;
      }

      const batch = firestore.batch();

      battalionsSnapshot.docs.forEach((battalionDoc) => {
        const battalionData = battalionDoc.data();
        if (battalionData.id !== battalionDoc.id) {
          console.log(`Updating battalion ${battalionDoc.id} in brigade ${brigadeName}...`);
          batch.update(battalionDoc.ref, { id: battalionDoc.id });
          battalionsUpdated++;
        }
      });

      await batch.commit();
    }));

    if (battalionsUpdated === 0) {
      console.log("All battalion documents already have the correct 'id' field.");
    } else {
      console.log(`Finished. Successfully updated ${battalionsUpdated} battalion documents.`);
    }
  } catch (error) {
    console.error('Error adding IDs to battalions:', error);
    console.error('Please ensure you have authenticated with Firebase for this command.');
  }
}

addBattalionIds();
