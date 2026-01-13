'use client';
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  LayoutTemplate,
  FileText,
  FileOutput,
  ChevronUp,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userAvatar = PlaceHolderImages.find((img) => img.id === "user-avatar");
  
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <p>טוען...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-7 shrink-0 text-primary" />
            <span className="font-headline text-lg">מערכת שליטה</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  <Home />
                  לוח מחוונים
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/templates">
                  <LayoutTemplate />
                  תבניות
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/reporting">
                  <FileText />
                  דיווח
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/reports">
                  <FileOutput />
                  דוחות
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Avatar className="size-8">
                {user.photoURL && <AvatarImage src={user.photoURL} alt="User avatar"/>}
                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium">{user.displayName || 'מטה חטיבה'}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <button>
              <ChevronUp className="size-4 text-muted-foreground" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <UserNav />
        </header>
        <main className="flex flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
