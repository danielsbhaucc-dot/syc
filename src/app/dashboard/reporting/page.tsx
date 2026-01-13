'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

export default function ReportingPageRedirect() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user) {
            // This is a protected route. We need to determine the user's role.
            // For now, we will redirect all users back to their main dashboard view.
            // The main dashboard will handle role-based redirects.
            router.replace('/dashboard');
        }
    }, [user, isUserLoading, router]);

    return (
        <div className="flex w-full justify-center items-center p-8">
            <Loader className="animate-spin h-8 w-8 text-primary" />
            <p className='ml-4'>מנתב מחדש...</p>
        </div>
    );
}
