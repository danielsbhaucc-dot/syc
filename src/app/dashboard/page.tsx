import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { mockUnits, Unit, UnitStatus } from "@/lib/data";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Package,
  ArrowUpRight,
} from "lucide-react";

const statusIcons: Record<UnitStatus, React.ReactNode> = {
  Nominal: <ShieldCheck className="h-4 w-4 text-green-500" />,
  Warning: <ShieldAlert className="h-4 w-4 text-yellow-500" />,
  Critical: <ShieldX className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<UnitStatus, string> = {
  Nominal: "bg-green-500/20 text-green-400 border-green-500/30",
  Warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DashboardPage() {
  const totalPersonnel = mockUnits.reduce(
    (acc, unit) => acc + unit.personnel.assigned,
    0
  );
  const totalEquipment = mockUnits.reduce(
    (acc, unit) => acc + unit.equipment.onHand,
    0
  );
  const overallReadiness =
    mockUnits.reduce((acc, unit) => acc + unit.readiness, 0) /
    mockUnits.length;
  const criticalAlerts = mockUnits.filter(
    (unit) => unit.status === "Critical"
  ).length;

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">
          לוח מחוונים חטיבתי
        </h1>
        <Button>צפה בדוח המלא</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              מוכנות כללית
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallReadiness.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              כלל הגדודים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך כל כוח אדם</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPersonnel}</div>
            <p className="text-xs text-muted-foreground">
              משובצים בכלל החטיבה
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך כל ציוד</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              פריטים במלאי
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-500/50 bg-red-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">התראות קריטיות</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{criticalAlerts}</div>
            <p className="text-xs text-red-400/80">
              יחידות הדורשות התייחסות מיידית
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>סקירת סטטוס גדודים</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">יחידה</TableHead>
                <TableHead>מפקד</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>כוח אדם (משובץ/תקן)</TableHead>
                <TableHead>ציוד (במלאי/תקן)</TableHead>
                <TableHead className="w-[150px]">מוכנות</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUnits.map((unit: Unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.commander}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`gap-2 ${statusColors[unit.status]}`}
                    >
                      {statusIcons[unit.status]}
                      {unit.status === 'Nominal' ? 'תקין' : unit.status === 'Warning' ? 'אזהרה' : 'קריטי'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {unit.personnel.assigned} / {unit.personnel.authorized}
                  </TableCell>
                  <TableCell>
                    {unit.equipment.onHand} / {unit.equipment.authorized}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={unit.readiness} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {unit.readiness}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      פרטים
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
