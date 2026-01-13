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
import { ArrowLeft, UserPlus, Shield } from "lucide-react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const auth = useAuth();
  const firestore = useFirestore();
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
    if (!auth || !firestore) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Create a brigade for the new user.
      // The brigade ID will be the user's UID for simplicity.
      const brigadeRef = doc(firestore, "brigades", newUser.uid);
      await setDoc(brigadeRef, {
        name: `החטיבה של ${newUser.email}`,
        location: "לא צוין",
        // Add the user as the first member with an 'admin' role.
        members: {
          [newUser.uid]: "admin",
        },
      });

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
      <div className="bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        <div className="text-center mb-8">
            <Shield className="w-20 h-20 mx-auto text-blue-500 mb-4" />
            <h1 className="text-4xl font-black text-white mb-2 font-headline tracking-tighter">יצירת משתמש חדש</h1>
            <p className="text-slate-400 font-semibold">הצטרף למערכת ניהול ומעקב פערים</p>
        </div>

        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4 p-0">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
                placeholder="בחר סיסמה"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
                placeholder="הקלד את הסיסמה שוב"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 p-0 pt-6">
            <Button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all shadow-lg">
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
      </div>
    </div>
  );
}
