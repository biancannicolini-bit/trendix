import { DashboardShell } from "@/components/layout/DashboardShell";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <DashboardShell isAdmin={isAdminEmail(session.user.email)}>
      {children}
    </DashboardShell>
  );
}
