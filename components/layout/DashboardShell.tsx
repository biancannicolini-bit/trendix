"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname.startsWith("/dashboard/settings")
    ? "settings"
    : "calendar";

  return <AppShell active={active}>{children}</AppShell>;
}
