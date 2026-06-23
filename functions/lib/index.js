"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBrigadeMembership = exports.createBattalionUser = void 0;
const admin = __importStar(require("firebase-admin"));
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
/**
 * Creates a new user with the 'battalion' role and assigns them to a specific battalion and brigade.
 * This function must be called by an authenticated user with the 'brigade' or 'admin' role.
 */
exports.createBattalionUser = (0, https_1.onCall)(async (request) => {
    // 1. Authentication and Authorization check
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const callingUserUid = request.auth.uid;
    const auth = (0, auth_1.getAuth)();
    const callingUser = await auth.getUser(callingUserUid);
    const callingUserClaims = callingUser.customClaims;
    // Ensure the caller is an admin or a brigade-level user
    if (callingUserClaims?.role !== 'admin' && callingUserClaims?.role !== 'brigade') {
        throw new https_1.HttpsError("permission-denied", "You do not have permission to perform this action.");
    }
    // 2. Input validation
    const { email, password, battalionId, brigadeId } = request.data;
    if (!email || !password || !battalionId || !brigadeId) {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with all required arguments: email, password, battalionId, and brigadeId.");
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
    }
    catch (error) {
        // 6. Error handling
        console.error("Error creating battalion user:", error);
        // Provide a more specific error message based on the Firebase error code
        if (error.code === 'auth/email-already-exists') {
            throw new https_1.HttpsError('already-exists', 'The email address is already in use by another account.');
        }
        if (error.code === 'auth/weak-password') {
            throw new https_1.HttpsError('invalid-argument', 'The password is not strong enough.');
        }
        throw new https_1.HttpsError("internal", "An internal error occurred while creating the user.");
    }
});
/**
 * Ensures the calling user is a member of the specified brigade, adding them as 'admin' if not already present.
 * If the brigade document does not exist, it creates it with the calling user as the first 'admin' member.
 */
exports.ensureBrigadeMembership = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const callingUserUid = request.auth.uid;
    const { brigadeId } = request.data;
    if (!brigadeId || typeof brigadeId !== 'string') {
        throw new https_1.HttpsError("invalid-argument", "A valid 'brigadeId' must be provided.");
    }
    const firestore = admin.firestore();
    const brigadeRef = firestore.collection('brigades').doc(brigadeId);
    try {
        const brigadeDoc = await brigadeRef.get();
        if (!brigadeDoc.exists) {
            // Brigade does not exist, create it and add the current user as admin
            const defaultBrigadeName = `חטיבה ${brigadeId.substring(0, 4)}`; // Use first few chars of ID for default name
            await brigadeRef.set({
                name: defaultBrigadeName,
                members: {
                    [callingUserUid]: 'admin',
                },
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                // Add any other default fields for a new brigade
            });
            return { status: "success", message: `Brigade ${defaultBrigadeName} created and user added as admin.` };
        }
        else {
            // Brigade exists, check and update membership
            const brigadeData = brigadeDoc.data();
            if (!brigadeData?.members || !brigadeData.members[callingUserUid]) {
                // User is not a member, add them as admin
                await brigadeRef.update({
                    [`members.${callingUserUid}`]: 'admin',
                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                });
                return { status: "success", message: `User ${callingUserUid} added as admin to brigade ${brigadeId}.` };
            }
            else {
                // User is already a member
                return { status: "success", message: `User ${callingUserUid} is already a member of brigade ${brigadeId}.` };
            }
        }
    }
    catch (error) {
        console.error("Error ensuring brigade membership:", error);
        throw new https_1.HttpsError("internal", "An internal error occurred while ensuring brigade membership.");
    }
});
//# sourceMappingURL=index.js.map