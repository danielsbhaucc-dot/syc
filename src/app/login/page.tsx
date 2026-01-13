import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center login-bg">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">TroopSync</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/dashboard">Sign In</Link>
          </Button>
          <div className="relative w-full">
            <Separator className="absolute left-0 top-1/2 w-full" />
            <p className="relative z-10 mx-auto w-fit bg-card px-2 text-center text-xs uppercase text-muted-foreground">
              Or
            </p>
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="access-code">One-time Access Code</Label>
            <div className="flex gap-2">
              <Input
                id="access-code"
                placeholder="Enter view-only access code"
              />
              <Button variant="secondary">View</Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
