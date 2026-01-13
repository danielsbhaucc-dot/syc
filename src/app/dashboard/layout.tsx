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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userAvatar = PlaceHolderImages.find((img) => img.id === "user-avatar");
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-7 shrink-0 text-primary" />
            <span className="font-headline text-lg">TroopSync</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive
                tooltip={{ children: "Dashboard" }}
              >
                <Link href="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: "Templates" }}>
                <Link href="/dashboard/templates">
                  <LayoutTemplate />
                  <span>Templates</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: "Reporting" }}>
                <Link href="/dashboard/reporting">
                  <FileText />
                  <span>Reporting</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: "Reports" }}>
                <Link href="/dashboard/reports">
                  <FileOutput />
                  <span>Reports</span>
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
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User avatar"/>}
                <AvatarFallback>BR</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium">Brigade Staff</span>
                <span className="text-xs text-muted-foreground">4th IBCT (AIRBORNE)</span>
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
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
