import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutTemplate } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-semibold mb-8">
        Template Management
      </h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Define Unit Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
            <LayoutTemplate className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Drag-and-Drop Interface Coming Soon
            </h3>
            <p className="max-w-md">
              Soon, you'll be able to create and manage templates defining
              required roles, authorizations, and equipment for different unit
              types right here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
