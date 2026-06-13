import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [active, total, newWeek, aiCost, tokens, cronErrors, churn] =
    await Promise.all([
      prisma.subscription.count({ where: { status: "authorized" } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.aiUsageLog.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { costUsd: true },
      }),
      prisma.aiUsageLog.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { tokensOutput: true },
      }),
      prisma.contentCalendar.count({
        where: { status: "error", generatedAt: { gte: weekAgo } },
      }),
      prisma.subscription.count({
        where: {
          status: { in: ["cancelled", "cancelling"] },
          updatedAt: { gte: monthStart },
        },
      }),
    ]);

  return NextResponse.json({
    activeUsers: active,
    totalUsers: total,
    newThisWeek: newWeek,
    mrr: active * 15000,
    aiCostUsd: aiCost._sum.costUsd ?? 0,
    tokensUsed: tokens._sum.tokensOutput ?? 0,
    cronErrors,
    churnThisMonth: churn,
  });
}
