'use server';

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// NOTE: No need for dotenv with Next.js. It loads .env.local automatically.

// Helper function to initialize Firebase Admin SDK safely
// This ensures it's initialized only once
function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        console.error('Firebase Admin Initialization Error: FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables. Make sure it is present in a .env.local file.');
        return null;
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('Firebase Admin Initialization Error: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.', error);
        return null;
    }
}

// Initialize admin outside of the request handler to ensure it's done only once.
const adminApp = initializeFirebaseAdmin();

export async function POST(req: NextRequest) {
    if (!adminApp) {
        const errorMessage = 'Server configuration error. Firebase Admin SDK not initialized. Is FIREBASE_SERVICE_ACCOUNT_KEY set in .env.local?';
        console.error(errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    try {
        const adminAuth = admin.auth(adminApp);
        const adminFirestore = admin.firestore(adminApp);

        const { email, password, brigadeId, battalionId } = await req.json();

        if (!email || !password || !brigadeId || !battalionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        const userRecord = await adminAuth.createUser({
            email,
            password,
            emailVerified: true,
            disabled: false,
        });

        await adminAuth.setCustomUserClaims(userRecord.uid, {
            role: 'battalion',
            brigadeId: brigadeId,
            battalionId: battalionId,
        });
        
        const brigadeRef = adminFirestore.doc(`brigades/${brigadeId}`);
        await brigadeRef.update({
            [`members.${userRecord.uid}`]: 'battalion'
        });

        return NextResponse.json({ uid: userRecord.uid, message: 'User created successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating user:', error);
        
        let errorMessage = 'An unexpected error occurred.';
        let statusCode = 500;

        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'This email is already in use by another account.';
            statusCode = 409;
        } else if (error.code === 'auth/invalid-password') {
            errorMessage = 'The password must be a string with at least six characters.';
            statusCode = 400;
        }

        return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
    }
}
