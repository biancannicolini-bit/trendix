import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const resolved = searchParams.get("resolved") === "true";

  const errors = await prisma.generationError.findMany({
    where: resolved ? { resolvedAt: { not: null } } : { resolvedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ errors });
}
