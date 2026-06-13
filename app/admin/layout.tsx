import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold">
              Admin
            </Link>
            <nav className="flex gap-4 text-sm text-gray-600">
              <Link href="/admin">Métricas</Link>
              <Link href="/admin/users">Usuarios</Link>
            </nav>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-600">
            Volver al app
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
