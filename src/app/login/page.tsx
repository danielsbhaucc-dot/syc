'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { ArrowRight, Shield, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth, useUser } from "@/firebase";
import { initiateEmailSignIn } from "@/firebase/non-blocking-login";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignIn(auth, email, password);
  };
  
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center login-bg">
        <p>טוען...</p>
      </div>
    );
  }

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

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                required
                className="bg-slate-800 border-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="bg-slate-800 border-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              <ArrowRight className="ml-2" />
              כניסה
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
