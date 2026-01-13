'use client';

import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, Users } from 'lucide-react';
import Link from 'next/link';

interface Platoon {
  id: string;
  name: string;
}

function PlatoonLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      <Skeleton className="h-9 w-64" />
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <Users className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                טוען נתוני מחלקה...
                </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PlatoonPage() {
  const params = useParams();
  const firestore = useFirestore();
  const { user } = useUser();

  const battalionId = params.battalionId as string;
  const companyId = params.companyId as string;
  const platoonId = params.platoonId as string;
  const brigadeId = user?.uid;

  const platoonRef = useMemoFirebase(() => {
    if (!firestore || !brigadeId || !battalionId || !companyId || !platoonId) return null;
    return doc(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies', companyId, 'platoons', platoonId);
  }, [firestore, brigadeId, battalionId, companyId, platoonId]);

  const { data: platoon, isLoading, error } = useDoc<Platoon>(platoonRef);

  if (isLoading || !platoon || !brigadeId) {
    return <PlatoonLoading />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center" dir="rtl">
        <ShieldAlert className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">אירעה שגיאה</h2>
        <p>לא ניתן היה לטעון את נתוני המחלקה.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter">
            מחלקה: {platoon.name}
          </h1>
          <Link href={`/dashboard/battalion/${battalionId}/company/${companyId}`} className="text-sm text-blue-400 hover:underline">
            חזרה לפלוגה
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>תצוגת כיתות וחיילים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <Users className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              תצוגת מחלקה בבנייה
            </h3>
            <p className="max-w-md">
              כאן תוצג תצוגה מפורטת של כיתות, חוליות, וחיילים, בדומה לדוגמה שסיפקת.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
