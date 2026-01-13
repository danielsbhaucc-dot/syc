import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ReportingPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-semibold mb-8">
        Battalion Reporting
      </h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Submit Status Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <FileText className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Reporting Forms Coming Soon
            </h3>
            <p className="max-w-md">
              Battalion-level users will soon be able to fill out forms detailing
              their current status, including personnel, authorizations, and
              equipment to populate the dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
