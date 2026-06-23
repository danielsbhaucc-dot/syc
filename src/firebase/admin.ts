import * as admin from 'firebase-admin';

// Check if the service account key is available
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
  throw new Error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Server functionality will be disabled.');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountKey);
} catch (e) {
  throw new Error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Please check the environment variable.');
}

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('CRITICAL: Failed to initialize Firebase Admin SDK:', error);
    // Re-throw the error to stop the application from starting in a broken state.
    throw error;
  }
}

// Export initialized services. These are now guaranteed to be non-null if the app starts.
const adminAuth = admin.auth();
const adminFirestore = admin.firestore();

export { adminAuth, adminFirestore };
