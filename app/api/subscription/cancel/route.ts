import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!sub) {
    return NextResponse.json({ error: "Sin suscripción" }, { status: 404 });
  }

  if (sub.status === "cancelling" || sub.status === "cancelled") {
    return NextResponse.json(
      { error: "La suscripción ya está cancelada o en proceso" },
      { status: 400 }
    );
  }

  if (!sub.mpSubscriptionId) {
    return NextResponse.json(
      { error: "Suscripción sin ID de Mercado Pago" },
      { status: 400 }
    );
  }

  const provider = getPaymentProvider("mercadopago");
  await provider.cancelSubscription(sub.mpSubscriptionId);

  const cancelAt = sub.nextBillingDate ?? new Date();

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      status: "cancelling",
      cancelAt,
    },
  });

  return NextResponse.json({ ok: true, cancelAt });
}
