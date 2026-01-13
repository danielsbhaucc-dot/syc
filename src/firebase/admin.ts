import * as admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | null = null;
let adminFirestore: admin.firestore.Firestore | null = null;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables.');
  }

  // Parse the stringified JSON from the environment variable
  const serviceAccount = JSON.parse(serviceAccountKey);

  if (admin.apps.length === 0) {
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
