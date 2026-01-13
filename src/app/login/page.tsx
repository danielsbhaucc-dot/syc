'use client';

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Shield, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [userType, setUserType] = useState<"brigade" | "battalion" | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center login-bg" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl bg-slate-900/90 backdrop-blur-lg border-slate-800">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl tracking-tighter">מערכת שליטה מחלקתית</CardTitle>
          <CardDescription>
            ניהול ומעקב פערים ברמת הגדוד והחטיבה
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label className="block text-sm font-bold text-slate-300 mb-3 text-center">בחר סוג משתמש:</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUserType('brigade')}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                  userType === 'brigade'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500'
                )}
              >
                <Shield className="w-8 h-8" />
                <span className="font-bold">חטיבה</span>
              </button>
              <button
                onClick={() => setUserType('battalion')}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                  userType === 'battalion'
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500'
                )}
              >
                <Users className="w-8 h-8" />
                <span className="font-bold">גדוד</span>
              </button>
            </div>
          </div>
          
          {userType && (
            <div className="space-y-2">
              <Label htmlFor="email">שם משתמש</Label>
              <Input
                id="email"
                type="email"
                placeholder={userType === 'brigade' ? 'user@hativa.idf.il' : 'user@gdud.idf.il'}
                required
                className="bg-slate-800 border-slate-700"
              />
            </div>
          )}

          {userType && (
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" type="password" required className="bg-slate-800 border-slate-700" />
            </div>
          )}

        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild disabled={!userType}>
            <Link href="/dashboard">
              <ArrowRight className="ml-2" />
              כניסה
            </Link>
          </Button>

          <div className="relative w-full">
            <Separator className="absolute left-0 top-1/2 w-full bg-slate-700" />
            <p className="relative z-10 mx-auto w-fit bg-slate-900 px-2 text-center text-xs uppercase text-muted-foreground">
              או
            </p>
          </div>

          <div className="w-full space-y-2 text-center">
            <Label htmlFor="access-code">כניסה עם קוד לצפייה בלבד</Label>
            <div className="flex gap-2">
              <Input
                id="access-code"
                placeholder="הכנס קוד גישה"
                className="bg-slate-800 border-slate-700"
              />
              <Button variant="secondary">צפה</Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
