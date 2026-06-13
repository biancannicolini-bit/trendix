import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      subscription: true,
      calendars: {
        orderBy: { generatedAt: "desc" },
        take: 10,
        include: { _count: { select: { posts: true } } },
      },
      aiUsageLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const aiCost = await prisma.aiUsageLog.aggregate({
    where: { userId: id, createdAt: { gte: monthStart } },
    _sum: { costUsd: true, tokensOutput: true },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      profile: user.profile,
      subscription: user.subscription,
      calendars: user.calendars.map((c) => ({
        id: c.id,
        weekStart: c.weekStart,
        status: c.status,
        generatedAt: c.generatedAt,
        costUsd: c.costUsd,
        postCount: c._count.posts,
      })),
      recentAiUsage: user.aiUsageLogs,
      aiCostThisMonth: aiCost._sum.costUsd ?? 0,
      tokensThisMonth: aiCost._sum.tokensOutput ?? 0,
    },
  });
}
