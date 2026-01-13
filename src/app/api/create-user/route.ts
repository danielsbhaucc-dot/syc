'use server';

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Helper function to initialize Firebase Admin SDK safely
function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables.');
    }

    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
        // We throw an error during initialization because the API cannot function without it.
        throw new Error('Failed to initialize Firebase Admin SDK. Please check service account credentials.');
    }
}


export async function POST(req: NextRequest) {
    try {
        // Initialize it once when the module is loaded
        const adminApp = initializeFirebaseAdmin();
        const adminAuth = admin.auth(adminApp);
        const adminFirestore = admin.firestore(adminApp);

        const { email, password, brigadeId, battalionId } = await req.json();

        // Basic validation
        if (!email || !password || !brigadeId || !battalionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        // TODO: Verify that the requesting user is an admin of the brigadeId.
        // This requires getting the UID of the requester from their ID token,
        // which should be passed in the Authorization header. For now, we'll
        // proceed with the creation but this is a critical security step.

        // Create the user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password,
            emailVerified: true,
            disabled: false,
        });

        // Set custom claims to store role and unit info directly on the auth token
        await adminAuth.setCustomUserClaims(userRecord.uid, {
            role: 'battalion',
            brigadeId: brigadeId,
            battalionId: battalionId,
        });
        
        // Also, add the user to the brigade's members list for rule consistency
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
            statusCode = 409; // Conflict
        } else if (error.code === 'auth/invalid-password') {
            errorMessage = 'The password must be a string with at least six characters.';
            statusCode = 400;
        } else if (error.message.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
            errorMessage = 'Server configuration error. Service account key is not set up.';
            statusCode = 500;
        }


        return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
    }
}
