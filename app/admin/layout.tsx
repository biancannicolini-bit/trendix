import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";

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
    <div className="min-h-screen bg-bg-secondary">
      <header
        className="border-b"
        style={{ background: BRAND.DARK, borderColor: BRAND.BORDER }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="transition-opacity hover:opacity-90">
              <Logo size={24} variant="dark" />
            </Link>
            <span
              className="hidden rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:inline"
              style={{ borderColor: BRAND.BORDER, color: BRAND.MUTED }}
            >
              Admin
            </span>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/admin"
                className="rounded-md px-3 py-1.5 font-medium text-brand-muted transition-colors hover:text-brand-light"
              >
                Métricas
              </Link>
              <Link
                href="/admin/users"
                className="rounded-md px-3 py-1.5 font-medium text-brand-muted transition-colors hover:text-brand-light"
              >
                Usuarios
              </Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-brand-muted transition-colors hover:text-brand-light"
          >
            Volver al app
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</div>
    </div>
  );
}
