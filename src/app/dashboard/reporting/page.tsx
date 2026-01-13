'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, FileText, Send, ShieldCheck, Users, Package } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Interfaces for our data structures
interface Battalion {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
  battalionId: string;
}

interface Platoon {
  id: string;
  name: string;
  companyId: string;
}

interface Soldier {
    id: string;
    name: string;
    role: string;
}


function ReportingForm({ brigadeId }: { brigadeId: string }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedBattalion, setSelectedBattalion] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedPlatoon, setSelectedPlatoon] = useState<string | null>(null);
  
  const [personnelCount, setPersonnelCount] = useState<number>(0);
  const [equipmentCount, setEquipmentCount] = useState<number>(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Battalions
  const battalionsQuery = useMemoFirebase(() => {
    if (!firestore || !brigadeId) return null;
    return collection(firestore, 'brigades', brigadeId, 'battalions');
  }, [firestore, brigadeId]);
  const { data: battalions, isLoading: loadingBattalions } = useCollection<Battalion>(battalionsQuery);

  // Fetch Companies for selected Battalion
  const companiesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedBattalion) return null;
    return query(collection(firestore, `brigades/${brigadeId}/battalions/${selectedBattalion}/companies`));
  }, [firestore, brigadeId, selectedBattalion]);
  const { data: companies, isLoading: loadingCompanies } = useCollection<Company>(companiesQuery);

  // Fetch Platoons for selected Company
  const platoonsQuery = useMemoFirebase(() => {
      if (!firestore || !selectedBattalion || !selectedCompany) return null;
      return query(collection(firestore, `brigades/${brigadeId}/battalions/${selectedBattalion}/companies/${selectedCompany}/platoons`));
  }, [firestore, brigadeId, selectedBattalion, selectedCompany]);
  const { data: platoons, isLoading: loadingPlatoons } = useCollection<Platoon>(platoonsQuery);

  const handleBattalionChange = (battalionId: string) => {
    setSelectedBattalion(battalionId);
    setSelectedCompany(null);
    setSelectedPlatoon(null);
  };
  
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setSelectedPlatoon(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBattalion) {
        toast({ variant: 'destructive', title: 'שגיאה', description: 'חובה לבחור גדוד.' });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        const batch = writeBatch(firestore);
        
        // This is a simplified update. A real scenario would be more complex.
        const battalionRef = doc(firestore, 'brigades', brigadeId, 'battalions', selectedBattalion);
        
        const readiness = Math.min(100, Math.round(((personnelCount / 80) * 0.6 + (equipmentCount / 100) * 0.4) * 100));
        let status: 'Nominal' | 'Warning' | 'Critical' = 'Nominal';
        if (readiness < 70) status = 'Warning';
        if (readiness < 50) status = 'Critical';
        
        batch.update(battalionRef, {
            'personnel.assigned': personnelCount,
            'personnel.authorized': 80, // Mock authorized count
            'equipment.onHand': equipmentCount,
            'equipment.authorized': 100, // Mock authorized count
            'readiness': readiness,
            'status': status
        });
        
        await batch.commit();
        
        toast({
            title: 'הדיווח נשלח בהצלחה!',
            description: 'נתוני המוכנות עודכנו במערכת.',
        });

    } catch (error) {
        console.error("Error submitting report:", error);
        toast({ variant: 'destructive', title: 'שגיאת שליחה', description: 'אירעה שגיאה בעת עדכון הנתונים.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>1. בחירת יחידה</CardTitle>
          <CardDescription>בחר את היחידה שעבורה ברצונך להגיש דיווח.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="battalion-select">גדוד</Label>
            <Select value={selectedBattalion ?? undefined} onValueChange={handleBattalionChange} dir="rtl">
              <SelectTrigger id="battalion-select">
                <SelectValue placeholder={loadingBattalions ? "טוען..." : "בחר גדוד"} />
              </SelectTrigger>
              <SelectContent>
                {battalions?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="company-select">פלוגה (אופציונלי)</Label>
            <Select value={selectedCompany ?? undefined} onValueChange={handleCompanyChange} disabled={!selectedBattalion || loadingCompanies}>
              <SelectTrigger id="company-select">
                <SelectValue placeholder={loadingCompanies ? "טוען..." : "בחר פלוגה"} />
              </SelectTrigger>
              <SelectContent>
                 {companies?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="platoon-select">מחלקה (אופציונלי)</Label>
            <Select value={selectedPlatoon ?? undefined} onValueChange={setSelectedPlatoon} disabled={!selectedCompany || loadingPlatoons}>
              <SelectTrigger id="platoon-select">
                <SelectValue placeholder={loadingPlatoons ? "טוען..." : "בחר מחלקה"} />
              </SelectTrigger>
              <SelectContent>
                {platoons?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. עדכון סטטוס כללי</CardTitle>
          <CardDescription>הזן את הנתונים המספריים עבור היחידה שנבחרה. נתונים אלו יעדכנו את לוח הבקרה החטיבתי.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="personnel-count" className="flex items-center gap-2"><Users className="text-muted-foreground" />כוח אדם (משובצים)</Label>
                <Input type="number" id="personnel-count" value={personnelCount} onChange={e => setPersonnelCount(Number(e.target.value))} placeholder="לדוגמה: 75" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="equipment-count" className="flex items-center gap-2"><Package className="text-muted-foreground" /> ציוד (פריטים במלאי)</Label>
                <Input type="number" id="equipment-count" value={equipmentCount} onChange={e => setEquipmentCount(Number(e.target.value))} placeholder="לדוגמה: 92" />
            </div>
          </div>
        </CardContent>
      </Card>
      
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
            <AccordionTrigger>דיווח מפורט (בקרוב)</AccordionTrigger>
            <AccordionContent>
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <FileText className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                ממשק דיווח מפורט יגיע לכאן
                </h3>
                <p className="max-w-md">
                בעתיד תוכל לנהל כאן את רשימת החיילים, לערוך ציוד פרטני, ולעדכן הסמכות עבור כל חייל ביחידה.
                </p>
            </div>
            </AccordionContent>
        </AccordionItem>
        </Accordion>


      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting || !selectedBattalion} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all">
          {isSubmitting ? <Loader className="animate-spin ml-2" /> : <Send className="ml-2" />}
          {isSubmitting ? 'שולח דיווח...' : 'שלח דיווח ועדכן מוכנות'}
        </Button>
      </div>
    </form>
  );
}


export default function ReportingPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading || !user) {
    return (
      <div className="flex w-full justify-center items-center p-8">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">
            דיווח סטטוס גדודי
        </h1>
        <p className="text-muted-foreground mt-1">ממשק זה מאפשר למפקדים ברמת הגדוד לעדכן את נתוני המוכנות עבור היחידות תחת פיקודם.</p>
      </div>

      <ReportingForm brigadeId={user.uid} />
    </div>
  );
}
