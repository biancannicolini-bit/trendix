import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { method } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const provider = getPaymentProvider(method);
  const { checkoutUrl, subscriptionId } = await provider.createSubscription({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      mpSubscriptionId: subscriptionId,
      status: "pending",
    },
    update: {
      mpSubscriptionId: subscriptionId,
      status: "pending",
    },
  });

  return NextResponse.json({ checkoutUrl });
}
