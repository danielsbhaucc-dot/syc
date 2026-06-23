
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SquadCard } from './SquadCard';
import { Platoon } from '@/types/platoon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { getIconByName } from '@/lib/icons';
import { ShieldCheck, TriangleAlert, RefreshCw } from 'lucide-react';

const loadingMessages = [
  "מצפין ערוצי תקשורת...",
  "סופר אפודים וקסדות...",
  "מכין קפה למפקד...",
  "בודק תקינות נשקים...",
  "מצחצח נעליים למסדר...",
];

export default function PlatoonDashboardPage({ params }: { params: { platoonId: string } }) {
  const [platoonData, setPlatoonData] = useState<Platoon | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1); 
  };

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    if (!params.platoonId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchPlatoonData() {
      setLoading(true);
      setPlatoonData(null); // Reset previous data

      const fetchDataPromise = fetch(`/api/platoon/${params.platoonId}`, { signal: controller.signal })
        .then(res => {
            if (!res.ok) { throw new Error('Network response was not ok'); }
            return res.json();
        });

      const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2500));

      try {
        const data: Platoon = await Promise.all([fetchDataPromise, minDelayPromise]).then(([data]) => data);

        data.squads.forEach(squad => {
          squad.soldiers.forEach(soldier => {
            soldier.icon = getIconByName(soldier.iconName);
            soldier.equipment.gaps = soldier.equipment.required.filter(
              item => !soldier.equipment.assigned.includes(item)
            );
          });
        });

        setPlatoonData(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Fetch error:", error);
          setPlatoonData(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPlatoonData();

    return () => {
      controller.abort();
    };
  }, [params.platoonId, retryCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl flex flex-col items-center justify-center shadow-2xl shadow-slate-900/50 w-full max-w-md">
          <div className="relative mb-5">
            <ShieldCheck className="w-24 h-24 text-blue-500/20 animate-pulse-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="color-spinner"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mb-3 tracking-wide">
            טוען נתוני מחלקה
          </h3>
          <p className="text-slate-400 h-6 text-center transition-opacity duration-300">
            {loadingMessages[currentMessageIndex]}
          </p>
          <div className="w-full bg-slate-700/50 rounded-full h-2.5 mt-6 overflow-hidden">
            <div className="w-full h-full bg-blue-600 rounded-full animate-infinite-loader"></div>
          </div>
        </div>
        <style jsx>{`
          .color-spinner { width: 70px; height: 70px; border-radius: 50%; background: conic-gradient(from 90deg at 50% 50%, #1d4ed8, #2563eb, #3b82f6, #60a5fa, #93c5fd, #bfdbfe, #dbeafe, #eff6ff, #1d4ed8); animation: spin 1.5s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .animate-infinite-loader { width: 100%; background-image: linear-gradient(90deg, #1d4ed8, #3b82f6, #1d4ed8); background-size: 200% 100%; animation: infinite-loader 2s ease-in-out infinite; }
          @keyframes infinite-loader { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}</style>
      </div>
    );
  }

  if (!platoonData) {
    return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-red-500/50 p-8 rounded-2xl flex flex-col items-center justify-center shadow-2xl shadow-red-900/50 w-full max-w-md text-center">
                <div className="relative mb-5">
                    <TriangleAlert className="w-20 h-20 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-100 mb-2 tracking-wide">
                    שגיאה בטעינת נתונים
                </h3>
                <p className="text-slate-400 mb-6 max-w-xs">
                    לא הצלחנו למשוך את הנתונים עבור המחלקה המבוקשת. ייתכן שיש תקלה זמנית.
                </p>
                <button
                    onClick={handleRetry}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center transition-colors duration-300 shadow-lg"
                >
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin-slow" />
                    נסה שוב
                </button>
            </div>
            <style jsx>{`
                .animate-spin-slow {
                    animation: spin 2s linear infinite;
                }
            `}</style>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-fade-in">
      <header className="dashboard-header grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-800/50 p-5 rounded-xl border border-slate-700 mb-10">
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-black text-white italic tracking-tighter">{platoonData.name}</h1>
          <p className="text-blue-400 font-bold mt-1">{platoonData.company} | תמונת מצב אמת</p>
        </div>
        <div className="lg:col-span-7 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center divide-x-reverse divide-slate-700">
            {Object.entries(platoonData.overview).map(([key, values]) => (
              <div key={key}>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{key}</span>
                {(values as string[]).map(value => (
                  <div key={value} className="text-sm font-bold text-white">{value}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 flex items-center justify-center">
          <Link href={`/dashboard/reporting/${params.platoonId}`} passHref>
            <span className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-colors duration-300 cursor-pointer">
              <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
              צפייה בדוח
            </span>
          </Link>
        </div>
      </header>
      <div id="platoon-grid">
        {platoonData.squads.map(squad => (
          <SquadCard key={squad.id} squad={squad} />
        ))}
      </div>
    </div>
  );
}
