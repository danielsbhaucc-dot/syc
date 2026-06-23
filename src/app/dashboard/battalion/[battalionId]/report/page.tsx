
import BattalionReport from "./BattalionReport";

export default function BattalionReportPage({ params }: { params: { battalionId: string } }) {
  return (
    <div dir="rtl" className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">
          דוח מצבת כוח אדם - גדוד {params.battalionId}
        </h1>
        {/* Add any actions here, e.g., a print button */}
      </div>
      <BattalionReport battalionId={params.battalionId} />
    </div>
  );
}
