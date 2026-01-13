import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutTemplate } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div dir="rtl">
      <h1 className="font-headline text-3xl font-semibold mb-8">
        ניהול תבניות
      </h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>הגדרת תקנים ליחידות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <LayoutTemplate className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              ממשק גרירה ושחרור יגיע בקרוב
            </h3>
            <p className="max-w-md">
              בקרוב תוכלו ליצור ולנהל תבניות המגדירות תפקידים נדרשים, הרשאות וציוד לסוגי יחידות שונים כאן.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
