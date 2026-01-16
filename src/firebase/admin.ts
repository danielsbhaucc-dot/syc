'use server';
import * as admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | null = null;
let adminFirestore: admin.firestore.Firestore | null = null;

try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please check your .env.local file.');
  }

  if (admin.apps.length === 0) {
    let serviceAccount;
    try {
      // The service account key from the environment variable might have escaped newlines or be improperly quoted.
      const sanitizedKey = serviceAccountString.replace(/\\n/g, '\n');
      serviceAccount = JSON.parse(sanitizedKey);
    } catch (e: any) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON.", e.message);
      console.error("Please ensure the FIREBASE_SERVICE_ACCOUNT_KEY in your .env.local file is a valid, single-line JSON string without extra characters, or is properly quoted if it's multi-line.");
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format.");
    }

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
