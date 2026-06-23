import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore, isAdminConfigured } from '@/firebase/admin';

export async function POST(req: NextRequest) {
    console.log('API Route /api/create-user POST function entered.'); // Added console.log here
    try { // Outer try block starts here
        if (!isAdminConfigured()) {
            const errorMessage = 'Server configuration error. Firebase Admin SDK not initialized. Is FIREBASE_SERVICE_ACCOUNT_KEY set in .env.local?';
            console.error(errorMessage);
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }

        const adminAuth = getAdminAuth();
        const adminFirestore = getAdminFirestore();

        try {
            const body = await req.json();
            const { email, password, brigadeId, battalionId } = body;

            if (!email || !password || !brigadeId || !battalionId) {
                return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
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
            
            let errorMessage = 'אירעה שגיאה לא צפויה.';
            let statusCode = 500;

            if (error.code === 'auth/email-already-exists') {
                errorMessage = 'כתובת האימייל הזו כבר בשימוש על ידי חשבון אחר.';
                statusCode = 409;
            } else if (error.code === 'auth/invalid-password') {
                errorMessage = 'הסיסמה חייבת להכיל לפחות 6 תווים.';
                statusCode = 400;
            }

            return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
        }
    } catch (outerError: any) { // Outer catch block starts here
        console.error('Critical error in POST /api/create-user (outer catch):', outerError);
        return NextResponse.json(
            { error: 'An unhandled server error occurred.', details: outerError.message || 'No details available.' },
            { status: 500 }
        );
    } // Outer catch block ends here
}