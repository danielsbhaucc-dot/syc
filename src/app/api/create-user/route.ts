'use server';

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize dotenv to load .env.local file
require('dotenv').config({ path: '.env.local' });

// Helper function to initialize Firebase Admin SDK safely
function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    // Check if the service account key is available in environment variables
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.error('Firebase Admin Initialization Error: FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local');
        // Do not throw an error here, let the POST handler manage the response
        return null;
    }

    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
        // Do not throw an error here
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
