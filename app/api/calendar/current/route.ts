import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveWeekStarts } from "@/lib/dates";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const weekStarts = getActiveWeekStarts();

  const calendars = await prisma.contentCalendar.findMany({
    where: {
      userId: session.user.id,
      weekStart: { in: weekStarts },
    },
    include: {
      posts: { orderBy: [{ day: "asc" }, { platform: "asc" }] },
    },
    orderBy: { weekStart: "desc" },
  });

  const calendar =
    calendars.find((c) => c.status === "ready") ??
    calendars.find((c) => c.status === "generating") ??
    calendars[0] ??
    null;

  return NextResponse.json({ calendar });
}
