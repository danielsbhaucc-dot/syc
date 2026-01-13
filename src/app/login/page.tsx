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
  const [userType, setUserType] = useState<"brigade" | "battalion" | null>(null);
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !userType) {
        toast({
            variant: "destructive",
            title: "שגיאה",
            description: "אנא בחר סוג משתמש (חטיבה/גדוד).",
        });
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Store user type in local storage to use it across the app
        localStorage.setItem('userType', userType);
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
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-3">בחר סוג משתמש:</label>
                    <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setUserType('brigade')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                        userType === 'brigade'
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500'
                        }`}>
                        <Shield className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-sm font-bold">חטיבה</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType('battalion')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                        userType === 'battalion'
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-emerald-500'
                        }`}>
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-sm font-bold">גדוד</div>
                    </button>
                    </div>
                </div>
                
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
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed shadow-lg"
                    disabled={!userType}
                >
                    <ArrowRight className="ml-2" />
                    כניסה למערכת
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/signup">
                    <UserPlus className="ml-2" />
                    יצירת משתמש חדש
                  </Link>
                </Button>
            </div>
        </form>
        <div className="mt-8 pt-6 border-t border-slate-700 text-center text-xs text-slate-400">
            <p>מערכת למעקב אחר פערי כוח אדם, הסמכה ואמצעים</p>
        </div>
      </div>
    </div>
  );
}

    