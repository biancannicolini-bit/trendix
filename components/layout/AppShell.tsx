import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  active?: "calendar" | "settings";
};

export function AppShell({ children, active = "calendar" }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <header
        className="border-b"
        style={{
          background: BRAND.DARK,
          borderColor: BRAND.BORDER,
        }}
      >
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/dashboard" className="transition-opacity hover:opacity-90">
            <Logo size={26} variant="dark" />
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard" active={active === "calendar"}>
              Calendario
            </NavLink>
            <NavLink href="/dashboard/settings" active={active === "settings"}>
              Ajustes
            </NavLink>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-4 py-8 lg:px-8">{children}</div>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200",
        active ? "text-brand-light" : "text-brand-muted hover:text-brand-light"
      )}
      style={active ? { background: BRAND.SURFACE } : undefined}
    >
      {children}
    </Link>
  );
}
