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
import { ArrowLeft, UserPlus } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { initiateEmailSignUp } from "@/firebase/non-blocking-login";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "הסיסמאות אינן תואמות.",
      });
      return;
    }
    if (!auth) return;
    try {
        await initiateEmailSignUp(auth, email, password);
        toast({
            title: "ההרשמה הצליחה!",
            description: "כעת תועבר למסך הכניסה.",
        });
        router.push('/login');
    } catch (error) {
        let description = "אירעה שגיאה לא צפויה.";
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    description = "כתובת האימייל כבר קיימת במערכת.";
                    break;
                case 'auth/invalid-email':
                    description = "כתובת האימייל אינה תקינה.";
                    break;
                case 'auth/weak-password':
                    description = "הסיסמה חלשה מדי. נסה סיסמה חזקה יותר.";
                    break;
                default:
                    description = "אירעה שגיאה במהלך ההרשמה.";
            }
        }
        toast({
            variant: "destructive",
            title: "שגיאת הרשמה",
            description: description,
        });
    }
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
          <CardTitle className="font-headline text-3xl tracking-tighter">יצירת משתמש חדש</CardTitle>
          <CardDescription>
            הצטרף למערכת ניהול ומעקב פערים
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignup}>
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
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">אימות סיסמה</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                className="bg-slate-800 border-slate-700"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              <UserPlus className="ml-2" />
              הרשמה
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="ml-2" />
                חזרה למסך הכניסה
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
