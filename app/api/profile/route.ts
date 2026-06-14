import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canGenerateForUser, triggerUserGeneration } from "@/lib/generation";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const data = await req.json();

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  const readyToGenerate = user && canGenerateForUser(user);

  if (readyToGenerate) {
    triggerUserGeneration(session.user.id);
    return NextResponse.json({
      profile,
      nextUrl: "/onboarding/generating",
    });
  }

  return NextResponse.json({ profile, nextUrl: "/onboarding/payment" });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ profile });
}
