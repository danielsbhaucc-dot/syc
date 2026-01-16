'use client';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, LayoutTemplate, FileText, FileOutput, Menu, X, ChevronsRight, ChevronsLeft, Settings, User as UserIcon, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { useUser, useAuth } from "@/firebase";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/page-wrapper";
import { UserNav } from "@/components/user-nav";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "לוח מחוונים" },
  { href: "/dashboard/templates", icon: LayoutTemplate, label: "תבניות" },
  { href: "/dashboard/reporting", icon: FileText, label: "דיווח" },
  { href: "/dashboard/reports", icon: FileOutput, label: "דוחות" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const updateMedia = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) {
      setMobileNavOpen(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    updateMedia();
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, [updateMedia]);

  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || !isClient) {
    return <LoadingScreen />;
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const NavLink = ({ href, icon: Icon, label, onClick }: { href: string, icon: React.ElementType, label: string, onClick?: () => void }) => {
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    return (
      <Link href={href} passHref>
        <div onClick={onClick} className={`relative flex items-center h-12 text-lg font-medium rounded-lg cursor-pointer transition-all duration-200 group px-4 ${isActive ? 'bg-primary/90 text-white shadow-lg shadow-primary/30' : 'text-muted-foreground hover:text-white hover:bg-white/10'}`}>
          <Icon className={`h-6 w-6 ml-4`} />
          <span>{label}</span>
          {!isActive && <div className="absolute right-0 h-0 w-1 bg-primary rounded-r-full transition-all duration-300 group-hover:h-6"></div>}
        </div>
      </Link>
    );
  };
  
  // ---===[ Sidebar for Mobile (off-canvas) ]===---
  const MobileSidebar = () => (
    <aside className={`fixed top-0 right-0 h-full w-72 z-50 bg-black/50 backdrop-blur-2xl border-l border-white/10 transition-all duration-300 ease-in-out ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full flex-col">
          <header className="flex items-center justify-between h-20 px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
                <Logo className="size-9 text-primary" />
                <span className="font-headline text-2xl font-bold">מערכת</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}><X className="h-7 w-7 text-white" /></Button>
          </header>
          <nav className="flex-1 p-4 space-y-3">
            {NAV_ITEMS.map(item => <NavLink key={item.href} {...item} onClick={() => setMobileNavOpen(false)} />)}
          </nav>
          <div className="p-4 border-t border-white/10">
              <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer h-12 text-lg font-medium text-muted-foreground hover:text-white focus:bg-destructive/50 focus:text-white rounded-lg">
                  <LogOut className="ml-4 h-6 w-6" />
                  <span>התנתקות</span>
              </DropdownMenuItem>
          </div>
      </div>
    </aside>
  );

  // ---===[ Bottom Nav for Mobile ]===---
  const MobileBottomNav = () => {
    const NavItem = ({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) => {
      const isActive = pathname === href;
      return (
        <Link href={href} className="flex flex-col items-center justify-center flex-1 gap-1 pt-2 pb-1">
          <div className={`p-2.5 rounded-full transition-all duration-200 ${isActive ? 'bg-primary/20' : ''}`}>
            <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <span className={`text-xs ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{label}</span>
        </Link>
      );
    };
    // Only show first 4 items in bottom nav
    const bottomNavItems = NAV_ITEMS.slice(0, 4);

    return (
      <nav className="fixed bottom-0 right-0 w-full h-[72px] bg-black/50 backdrop-blur-xl border-t border-white/10 z-40 flex items-start justify-around md:hidden">
        {bottomNavItems.map(item => <NavItem key={item.href} {...item} />)}
      </nav>
    );
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground" dir="rtl">
      {/* This structure is for desktop only, mobile uses bottom nav */}
      {!isMobile && (
         <aside className={`fixed top-0 right-0 h-full z-40 bg-black/30 backdrop-blur-xl border-l border-white/10 w-72`}>
            {/* Desktop sidebar content is similar to mobile, but without collapse/expand */}
            <div className="flex h-full flex-col">
                <header className="flex items-center h-20 px-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Logo className="size-9 text-primary" />
                        <span className="font-headline text-2xl font-bold">מערכת</span>
                    </div>
                </header>
                <nav className="flex-1 p-4 space-y-3">
                    {NAV_ITEMS.map(item => <NavLink key={item.href} {...item} />)}
                </nav>
                 <div className="p-4 border-t border-white/10">
                    {/* UserNav is now in the header for desktop */}
                </div>
            </div>
        </aside>
      )}

      {isMobile && <MobileSidebar />}
      {isMobile && isMobileNavOpen && <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setMobileNavOpen(false)}></div>}
      
      <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isMobile ? 'pb-[72px]' : 'mr-72'}`}>
        <header className="flex h-20 items-center justify-between sm:justify-end bg-transparent px-4 sm:px-8 sticky top-0 z-30">
           {isMobile ? (
                <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)}>
                  <Menu className="h-7 w-7 text-white" />
                </Button>
           ) : (
                <div/> // Placeholder for desktop header content if needed
           )}
           <UserNav/>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <PageWrapper>
            {children}
          </PageWrapper>
        </main>
      </div>

      {isMobile && <MobileBottomNav />}
    </div>
  );
}
