import * as admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | null = null;
let adminFirestore: admin.firestore.Firestore | null = null;

try {
  // Directly embedding the service account key as a string.
  // This avoids issues with environment variable parsing in some environments.
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found.');
  }

  if (admin.apps.length === 0) {
    // Parse the JSON string to get the service account object
    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  adminAuth = admin.auth();
  adminFirestore = admin.firestore();

} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
  // Keep adminAuth and adminFirestore as null if initialization fails
}

export { adminAuth, adminFirestore };
