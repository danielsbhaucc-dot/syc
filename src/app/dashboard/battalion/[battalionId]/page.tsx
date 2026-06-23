
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Building, Shield, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { adminFirestore as firestore } from "@/firebase/admin";

// Defines the structure for data fetched from Firestore
interface Company {
    id: string;
    name: string;
    platoons: { id: string; name: string }[];
}
interface Battalion {
    id: string;
    name: string;
    companies: Company[];
}

// THE PROFESSIONAL & ROBUST METHOD:
// Query the collection group by a dedicated 'id' field. This is standard practice.
async function getBattalionData(battalionId: string): Promise<Battalion | null> {
    try {
        const battalionsGroup = firestore.collectionGroup('battalions');
        const q = battalionsGroup.where('id', '==', battalionId).limit(1);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            console.warn(`Battalion with ID ${battalionId} not found. Ensure the document exists, has an 'id' field matching its document ID, and that the required Firestore index has been created.`);
            return null;
        }

        const battalionDoc = querySnapshot.docs[0];
        return processBattalionDoc(battalionDoc);

    } catch (error: any) {
        if (error.message.includes('requires an index')) {
            console.error("**************** FIRESTORE INDEX REQUIRED ****************");
            console.error("The query on 'battalions' collection group by 'id' field needs an index.");
            console.error("Please create this index in your Firebase console. The error message below may contain a direct link.");
            console.error(error.message);
            console.error("**********************************************************");
            throw new Error(`FIRESTORE INDEX REQUIRED. See server logs for details.`);
        }
        console.error(`Error getting battalion data from Firestore: ${error.message}`);
        return null;
    }
}

// Helper function to process the document once found.
async function processBattalionDoc(battalionDoc: FirebaseFirestore.QueryDocumentSnapshot): Promise<Battalion> {
    const data = battalionDoc.data()!;

    const companiesCollection = battalionDoc.ref.collection('companies');
    const companiesSnapshot = await companiesCollection.get();
    const companies = await Promise.all(
        companiesSnapshot.docs.map(async (companyDoc) => {
            const companyData = companyDoc.data();
            const platoonsCollection = companyDoc.ref.collection('platoons');
            const platoonsSnapshot = await platoonsCollection.get();
            const platoons = platoonsSnapshot.docs.map(platoonDoc => ({
                id: platoonDoc.id,
                ...(platoonDoc.data() as { name: string })
            }));

            return {
                id: companyDoc.id,
                name: companyData.name!,
                platoons
            };
        })
    );

    return {
        id: battalionDoc.id,
        name: data.name,
        companies: companies,
    };
}


export default async function BattalionPage({ params: { battalionId } }: { params: { battalionId: string } }) {
  const battalionData = await getBattalionData(battalionId);

  if (!battalionData) {
    return (
        <div dir="rtl" className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-500">שגיאה: הגדוד לא נמצא</h1>
            <p className="mt-2 text-muted-foreground">לא נמצא גדוד עם המזהה: {battalionId}.</p>
            <p className="mt-1 text-muted-foreground">ודא שהגדוד קיים, שיש לו שדה 'id' תואם, ושהאינדקס הנדרש נוצר ב-Firestore.</p>
            <Link href="/dashboard"><Button variant="outline" className="mt-6">חזרה לעמוד הראשי</Button></Link>
        </div>
    );
  }

  return (
    <div dir="rtl" className="w-full space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">
          {battalionData.name}
        </h1>
        <Button> <PlusCircle className="ml-2 h-4 w-4"/>הוסף פלוגה חדשה</Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>פעולות מהירות ודוחות</CardTitle>
          <CardDescription>גישה מהירה לדוחות ופעולות ניהוליות ברמת הגדוד.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard
            icon={<FileText className="h-6 w-6 text-primary" />}
            title="צפייה בדוח מצבת מלא"
            description="דוח ויזואלי מפורט של כלל הלוחמים, הציוד והפערים בגדוד."
            href={`/dashboard/battalion/${battalionId}/report`}
            linkText="פתח דוח"
          />
          <QuickActionCard
            icon={<Users className="h-6 w-6 text-primary" />}
            title="ניהול משתמשי המערכת"
            description="הוסף, הסר ונהל הרשאות גישה למשתמשים המשויכים לגדוד זה."
            href={`/dashboard/battalion/${battalionId}/users`}
            linkText="נהל משתמשים"
          />
        </CardContent>
      </Card>
      <h2 className="font-headline text-2xl font-semibold border-b pb-2">ניהול יחידות</h2>
      <div className="space-y-6">
        {battalionData.companies.length > 0 ? (
            battalionData.companies.map((company: Company) => (
              <Card key={company.id} className="bg-card-alt border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Building className="h-6 w-6 text-muted-foreground"/>
                    <CardTitle className="text-2xl">{company.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="icon"><PlusCircle className="h-5 w-5 text-muted-foreground"/></Button>
                     <Button variant="ghost" size="icon"><Trash2 className="h-5 w-5 text-destructive"/></Button>
                  </div>
                </CardHeader>
                <CardContent className="pl-10 pr-6 space-y-4">
                  <h4 className="font-semibold text-md mb-3">מחלקות בפלוגה:</h4>
                  {company.platoons.map((platoon) => (
                      <div key={platoon.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                        <Link href={`/dashboard/battalion/${battalionId}/company/${company.id}/platoon/${platoon.id}`} passHref className="flex items-center gap-4 cursor-pointer w-full">
                            <Shield className="h-5 w-5 text-primary/70" />
                            <span className="font-medium text-lg">{platoon.name}</span>
                        </Link>
                        <Button variant="ghost" size="icon" className="mr-2"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                      </div>
                  ))}
                </CardContent>
              </Card>
            ))
        ) : (
            <div className="text-center py-12 px-6 bg-card/50 rounded-xl border-2 border-dashed border-border">
                <Building className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-xl font-headline">לא נמצאו פלוגות</h3>
                <p className="mt-2 text-muted-foreground">התחל בהוספת הפלוגה הראשונה לגדוד זה.</p>
            </div>
        )}
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, href, linkText }: any) {
  return (
    <div className="flex flex-col items-start p-6 bg-card rounded-lg border-2 border-transparent hover:border-primary transition-all">
        <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
            <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground mt-1">{description}</p>
            </div>
        </div>
        <Link href={href} passHref className="mt-6 w-full">
            <Button className="w-full" variant="outline">{linkText}</Button>
        </Link>
    </div>
  );
}
