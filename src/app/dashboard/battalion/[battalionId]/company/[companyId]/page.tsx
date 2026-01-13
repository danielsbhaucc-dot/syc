'use client';

import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, ShieldAlert, PlusCircle, Loader, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
}

function CompanyLoading() {
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
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>מחלקות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <Loader className="w-16 h-16 mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              טוען מחלקות...
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompanyPage() {
  const params = useParams();
  const firestore = useFirestore();
  const { user } = useUser();

  const battalionId = params.battalionId as string;
  const companyId = params.companyId as string;
  const brigadeId = user?.uid;

  const companyRef = useMemoFirebase(() => {
    if (!firestore || !brigadeId || !battalionId || !companyId) return null;
    return doc(firestore, 'brigades', brigadeId, 'battalions', battalionId, 'companies', companyId);
  }, [firestore, brigadeId, battalionId, companyId]);

  const { data: company, isLoading, error } = useDoc<Company>(companyRef);

  if (isLoading || !company || !brigadeId) {
    return <CompanyLoading />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center" dir="rtl">
        <ShieldAlert className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">אירעה שגיאה</h2>
        <p>לא ניתן היה לטעון את נתוני הפלוגה.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter">
            פלוגה: {company.name}
          </h1>
          <Link href={`/dashboard/battalion/${battalionId}`} className="text-sm text-blue-400 hover:underline">
            חזרה לגדוד
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>מחלקות</CardTitle>
          <Button disabled>
            <PlusCircle className="ml-2" />
            הוסף מחלקה (בקרוב)
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
              <Users className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                  אין עדיין מחלקות בפלוגה זו
              </h3>
              <p className="max-w-md mb-6">
                  היכולת להוסיף ולנהל מחלקות תתווסף בקרוב.
              </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
