'use server';
import * as admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | null = null;
let adminFirestore: admin.firestore.Firestore | null = null;

try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found.');
  }

  if (admin.apps.length === 0) {
    // The service account key from the environment variable might have escaped newlines.
    // We need to replace them with actual newline characters for JSON.parse to work correctly.
    const serviceAccount = JSON.parse(serviceAccountString.replace(/\\n/g, '\n'));

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
