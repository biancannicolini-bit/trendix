import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveWeekStarts } from "@/lib/dates";
import { canGenerateForUser, triggerUserGeneration } from "@/lib/generation";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, subscription: true },
  });

  if (!user?.profile) {
    return NextResponse.json({ error: "Perfil incompleto" }, { status: 400 });
  }

  if (!canGenerateForUser(user)) {
    return NextResponse.json({ error: "Suscripción inactiva" }, { status: 403 });
  }

  const weekStarts = getActiveWeekStarts();
  const existing = await prisma.contentCalendar.findFirst({
    where: {
      userId: user.id,
      weekStart: { in: weekStarts },
    },
    orderBy: { weekStart: "desc" },
  });

  if (existing?.status === "ready" || existing?.status === "generating") {
    return NextResponse.json({ started: false, status: existing.status });
  }

  triggerUserGeneration(user.id);
  return NextResponse.json({ started: true });
}
