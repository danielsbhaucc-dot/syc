'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export function WelcomeScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/login');
        }, 3500); // 3.5 שניות להצגת המסך

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center login-bg" dir="rtl">
            <div className="relative flex flex-col items-center justify-center text-center animate-fade-in-long">
                <div className="scanline-subtle"></div>
                <Shield className="w-28 h-28 text-blue-500 glow-soft" />
                <h1 className="mt-6 text-4xl md:text-5xl font-black text-white font-headline tracking-tighter animate-slide-up-slow">
                    מערכת שליטה מחלקתית
                </h1>
                <p className="mt-2 text-lg text-slate-400 font-semibold animate-slide-up-slow delay-200">
                    ניהול וניתוח פערים בזמן אמת
                </p>
            </div>
             <style jsx>{`
                .animate-fade-in-long {
                    animation: fadeIn 2s ease-in-out forwards;
                }
                .animate-slide-up-slow {
                    animation: slideUp 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                    opacity: 0;
                    transform: translateY(20px);
                    animation-delay: 0.5s; 
                }
                 .delay-200 {
                    animation-delay: 0.7s;
                 }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .glow-soft {
                    filter: drop-shadow(0 0 15px hsl(var(--primary) / 0.6));
                    animation: glow-pulse-soft 3s infinite ease-in-out;
                }
                 @keyframes glow-pulse-soft {
                    0%, 100% {
                        filter: drop-shadow(0 0 15px hsl(var(--primary) / 0.5));
                    }
                    50% {
                        filter: drop-shadow(0 0 25px hsl(var(--primary) / 0.7));
                    }
                 }
                .scanline-subtle {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        to bottom,
                        transparent,
                        transparent 90%,
                        hsla(var(--primary) / 0.1) 95%,
                        transparent
                    );
                    background-size: 100% 8px;
                    animation: scan 15s linear infinite;
                    pointer-events: none;
                    opacity: 0.5;
                 }
            `}</style>
        </div>
    );
}
