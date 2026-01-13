import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileOutput } from "lucide-react";

export default function ReportsPage() {
  return (
    <div dir="rtl">
      <h1 className="font-headline text-3xl font-semibold mb-8">ייצוא נתונים</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>הפקה וייצוא של דוחות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <FileOutput className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              דיווח מתקדם יגיע בקרוב
            </h3>
            <p className="max-w-md mb-6">
              חלק זה יאפשר לכם לייצא דוחות מעוצבים בפורמט PDF ו-Excel, כולל נתונים היסטוריים לניתוח מגמות.
            </p>
            <div className="flex gap-4">
              <Button disabled>ייצא כ-PDF</Button>
              <Button disabled>ייצא כ-Excel</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
