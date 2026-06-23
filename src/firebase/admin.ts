import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

let initialized = false;

function ensureInitialized(): void {
  if (initialized) {
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error(
      'CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Server functionality will be disabled.'
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch {
    throw new Error(
      'CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Please check the environment variable.'
    );
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }

  initialized = true;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
}

export function getAdminAuth(): Auth {
  ensureInitialized();
  return admin.auth();
}

export function getAdminFirestore(): Firestore {
  ensureInitialized();
  return admin.firestore();
}
