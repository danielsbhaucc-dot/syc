
import UserManagement from "./UserManagement";

export default function BattalionUsersPage({ params }: { params: { battalionId: string } }) {
  return (
    <div dir="rtl" className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">
          ניהול משתמשים - גדוד {params.battalionId}
        </h1>
      </div>
      <UserManagement battalionId={params.battalionId} />
    </div>
  );
}
