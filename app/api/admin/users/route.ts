import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? "all";
  const PAGE = 20;

  const where =
    status === "all" ? {} : { subscription: { status } };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        subscription: true,
        calendars: {
          orderBy: { generatedAt: "desc" },
          take: 1,
          select: { status: true, generatedAt: true, costUsd: true },
        },
        _count: { select: { calendars: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
    prisma.user.count({ where }),
  ]);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const costs = await prisma.aiUsageLog.groupBy({
    by: ["userId"],
    where: {
      userId: { in: users.map((u) => u.id) },
      createdAt: { gte: monthStart },
    },
    _sum: { costUsd: true },
  });
  const costMap = Object.fromEntries(
    costs.map((c) => [c.userId, c._sum.costUsd ?? 0])
  );

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt,
      profile: u.profile,
      subscription: u.subscription,
      aiCostThisMonth: costMap[u.id] ?? 0,
      calendarCount: u._count.calendars,
      lastCalendar: u.calendars[0] ?? null,
    })),
    total,
    pages: Math.ceil(total / PAGE),
  });
}
