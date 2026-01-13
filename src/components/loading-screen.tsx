'use client';

import { Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

const loadingMessages = [
  "מאמת נתונים...",
  "טוען מפות טקטיות...",
  "מצפין ערוצי תקשורת...",
  "מכין דשבורד משימה...",
  "מסתנכרן עם לוויינים...",
  "טוען פרוטוקולי אבטחה...",
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center login-bg" dir="rtl">
      <div className="relative flex flex-col items-center justify-center">
        <div className="scanline"></div>
        <Shield className="w-24 h-24 text-blue-500 glow" />
        <h2 className="mt-6 text-xl font-semibold text-slate-300 tracking-wider transition-opacity duration-500">
            {loadingMessages[messageIndex]}
        </h2>
        <p className="text-slate-500 text-sm mt-1">אנא המתן...</p>
      </div>
      <div className="absolute bottom-10 w-full max-w-xs overflow-hidden rounded-full bg-slate-800/50 h-2 border border-slate-700">
        <div className="h-full rounded-full bg-blue-500 loading-bar-inner"></div>
      </div>
    </div>
  );
}
