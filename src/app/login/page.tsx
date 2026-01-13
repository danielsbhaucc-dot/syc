'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { Shield, Users, ArrowRight, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // User type selection is removed for now, login will determine role.
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      // The dashboard page will handle redirection based on user role.
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({
            variant: "destructive",
            title: "שגיאה",
            description: "שירותי האימות לא אותחלו כראוי.",
        });
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // We will determine user type on the dashboard page based on their permissions.
        // No need to set it in local storage anymore for this simplified flow.
        router.push("/dashboard");
    } catch (error) {
        let description = "שם המשתמש או הסיסמה שהזנת אינם נכונים.";
        if (error instanceof FirebaseError) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "שם המשתמש או הסיסמה שהזנת אינם נכונים.";
            } else if (error.code === 'auth/invalid-email') {
                description = "כתובת האימייל אינה תקינה.";
            }
        }
        toast({
            variant: "destructive",
            title: "שגיאת התחברות",
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
            <h1 className="text-4xl font-black text-white mb-2 font-headline tracking-tighter">מערכת שליטה מחלקתית</h1>
            <p className="text-slate-400 font-semibold">מערכת לניהול ומעקב אחר פערים</p>
        </div>

        <form onSubmit={handleLogin}>
            <div className="space-y-6">
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
                        placeholder="הקלד את הסיסמה"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all shadow-lg"
                >
                    <ArrowRight className="ml-2" />
                    כניסה למערכת
                </Button>
                
                <div className="text-center text-sm">
                    <span className="text-slate-400">אין לך חטיבה? </span>
                    <Button variant="link" className="p-0 text-blue-400" asChild>
                        <Link href="/signup">
                            צור חטיבה חדשה
                        </Link>
                    </Button>
                </div>
            </div>
        </form>
        <div className="mt-8 pt-6 border-t border-slate-700 text-center text-xs text-slate-400">
            <p>מערכת למעקב אחר פערי כוח אדם, הסמכה ואמצעים</p>
        </div>
      </div>
    </div>
  );
}
