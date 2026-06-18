import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const completed = Boolean(body.completed);

  const post = await prisma.post.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { completed, completedAt: completed ? new Date() : null },
    select: { id: true, completed: true },
  });

  return NextResponse.json(updated);
}
