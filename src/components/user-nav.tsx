'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser } from "@/firebase";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth(); // Correctly get the auth instance
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />}
            <AvatarFallback className="bg-background text-primary">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur-lg border-white/10 text-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || "מטה חטיבה"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10"/>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => router.push('/dashboard/profile')} className="cursor-pointer focus:bg-white/10 focus:text-white">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>פרופיל</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push('/dashboard/settings')} className="cursor-pointer focus:bg-white/10 focus:text-white">
            <Settings className="mr-2 h-4 w-4" />
            <span>הגדרות</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/10"/>
        <DropdownMenuItem
          className="cursor-pointer focus:bg-destructive/50 focus:text-white"
          disabled={isLoggingOut || isUserLoading}
          onClick={async () => {
            setIsLoggingOut(true);
            if (!auth) {
              toast({ variant: "destructive", title: "שגיאה קריטית", description: "שירות האימות אינו זמין. נסה לרענן את העמוד." });
              setIsLoggingOut(false);
              return;
            }
            try {
              await auth.signOut();
              router.push('/login');
            } catch (error) {
              console.error("Error signing out: ", error);
              toast({ variant: "destructive", title: "שגיאה", description: "אירעה שגיאה בזמן ההתנתקות." });
              setIsLoggingOut(false);
            }
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? <span>מנתק...</span> : <span>התנתקות</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
