import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const where = {
    userId: session.user.id,
    createdAt: { gte: start, lt: end },
  };

  const [total, completed] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.count({ where: { ...where, completed: true } }),
  ]);

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return NextResponse.json({
    month: MONTHS[now.getMonth()],
    total,
    completed,
    percentage,
  });
}
