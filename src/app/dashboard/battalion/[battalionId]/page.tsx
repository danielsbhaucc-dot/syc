'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MapPin, ShieldAlert } from 'lucide-react';

interface Battalion {
    id: string;
    name: string;
    location: string;
}

function BattalionLoading() {
    return (
        <div className="space-y-6" dir="rtl">
            <Skeleton className="h-9 w-64" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-5 w-40" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>פלוגות</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                        <Users className="w-16 h-16 mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                        מבנה הפלוגות יוגדר כאן
                        </h3>
                        <p className="max-w-md">
                        בקרוב תוכל לנהל את הפלוגות והמחלקות המשויכות לגדוד זה.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function BattalionPage() {
  const params = useParams();
  const firestore = useFirestore();
  const { user } = useFirebase();

  const battalionId = params.battalionId as string;
  const brigadeId = user?.uid;

  const battalionRef = useMemoFirebase(() => {
    if (!firestore || !brigadeId || !battalionId) return null;
    return doc(firestore, 'brigades', brigadeId, 'battalions', battalionId);
  }, [firestore, brigadeId, battalionId]);

  const { data: battalion, isLoading, error } = useDoc<Battalion>(battalionRef);

  if (isLoading || !battalion) {
    return <BattalionLoading />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center" dir="rtl">
          <ShieldAlert className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">אירעה שגיאה</h2>
        <p>לא ניתן היה לטעון את נתוני הגדוד.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      <h1 className="font-headline text-4xl font-bold tracking-tighter">
        דף גדוד: {battalion.name}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>פרטי הגדוד</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-lg">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-muted-foreground" />
            <span className="font-medium">שם:</span>
            <span>{battalion.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-muted-foreground" />
            <span className="font-medium">מיקום:</span>
            <span>{battalion.location}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>פלוגות</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <Users className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                מבנה הפלוגות יוגדר כאן
                </h3>
                <p className="max-w-md">
                בקרוב תוכל לנהל את הפלוגות והמחלקות המשויכות לגדוד זה.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
