'use server';

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This should be done only once.
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}


export async function POST(req: NextRequest) {
    try {
        const { email, password, brigadeId, battalionId } = await req.json();

        // Basic validation
        if (!email || !password || !brigadeId || !battalionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const auth = admin.auth();
        
        // TODO: Verify that the requesting user is an admin of the brigadeId.
        // This requires getting the UID of the requester from their ID token,
        // which should be passed in the Authorization header. For now, we'll
        // proceed with the creation but this is a critical security step.

        // Create the user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            emailVerified: true,
            disabled: false,
        });

        // Set custom claims to store role and unit info directly on the auth token
        await auth.setCustomUserClaims(userRecord.uid, {
            role: 'battalion',
            brigadeId: brigadeId,
            battalionId: battalionId,
        });
        
        // Also, add the user to the brigade's members list for rule consistency
        const db = admin.firestore();
        const brigadeRef = db.doc(`brigades/${brigadeId}`);
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
        }

        return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
    }
}
