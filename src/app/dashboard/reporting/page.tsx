import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ReportingPage() {
  return (
    <div dir="rtl">
      <h1 className="font-headline text-3xl font-semibold mb-8">
        דיווח גדודי
      </h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>הגשת דוח סטטוס</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <FileText className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              טפסי דיווח יגיעו בקרוב
            </h3>
            <p className="max-w-md">
              משתמשים ברמת הגדוד יוכלו למלא טפסים המפרטים את הסטטוס הנוכחי שלהם, כולל כוח אדם, הרשאות וציוד כדי לאכלס את לוח המחוונים.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
