import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileOutput } from "lucide-react";

export default function ReportsPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-semibold mb-8">Data Export</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Generate and Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <FileOutput className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Advanced Reporting Coming Soon
            </h3>
            <p className="max-w-md mb-6">
              This section will allow you to export formatted reports in PDF and
              Excel formats, including historical data for trend analysis.
            </p>
            <div className="flex gap-4">
              <Button disabled>Export as PDF</Button>
              <Button disabled>Export as Excel</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
