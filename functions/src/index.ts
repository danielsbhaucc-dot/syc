import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";

// Initialize Firebase Admin SDK
initializeApp();

/**
 * Creates a new user with the 'battalion' role and assigns them to a specific battalion and brigade.
 * This function must be called by an authenticated user with the 'brigade' or 'admin' role.
 */
export const createBattalionUser = onCall(async (request) => {
  // 1. Authentication and Authorization check
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const callingUserUid = request.auth.uid;
  const auth = getAuth();
  const callingUser = await auth.getUser(callingUserUid);
  const callingUserClaims = callingUser.customClaims;

  // Ensure the caller is an admin or a brigade-level user
  if (callingUserClaims?.role !== 'admin' && callingUserClaims?.role !== 'brigade') {
    throw new HttpsError("permission-denied", "You do not have permission to perform this action.");
  }

  // 2. Input validation
  const { email, password, battalionId, brigadeId } = request.data;
  if (!email || !password || !battalionId || !brigadeId) {
    throw new HttpsError("invalid-argument", "The function must be called with all required arguments: email, password, battalionId, and brigadeId.");
  }

  try {
    // 3. Create the new user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: `משתמש גדוד ${battalionId}`,
    });

    // 4. Set custom claims for the new user
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'battalion',
      battalionId: battalionId,
      brigadeId: brigadeId,
    });

    // 5. Return success response
    return {
      status: "success",
      message: `User ${email} created successfully with battalion role.`,
      uid: userRecord.uid
    };

  } catch (error: any) {
    // 6. Error handling
    console.error("Error creating battalion user:", error);
    // Provide a more specific error message based on the Firebase error code
    if (error.code === 'auth/email-already-exists') {
        throw new HttpsError('already-exists', 'The email address is already in use by another account.');
    }
    if (error.code === 'auth/weak-password') {
        throw new HttpsError('invalid-argument', 'The password is not strong enough.');
    }
    throw new HttpsError("internal", "An internal error occurred while creating the user.");
  }
});