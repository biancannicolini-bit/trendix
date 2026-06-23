"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export function DashboardShell({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname.startsWith("/dashboard/settings")
    ? "settings"
    : "calendar";

  return (
    <AppShell active={active} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
