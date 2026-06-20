import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";

/** Extrae el detalle real de un error del SDK de Mercado Pago. */
function describeError(e: unknown): string {
  const anyE = e as { cause?: unknown; message?: string };
  if (Array.isArray(anyE?.cause) && anyE.cause.length) {
    return anyE.cause
      .map((c) => {
        const cc = c as { description?: string; message?: string; code?: string | number };
        return cc.description ?? cc.message ?? String(cc.code ?? "");
      })
      .filter(Boolean)
      .join("; ");
  }
  return anyE?.message ?? "Error desconocido";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { mode } = await req.json();
  const oneTime = mode === "one_time";

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  try {
    const provider = getPaymentProvider("mercadopago");
    const params = {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
    };

    if (oneTime) {
      const { checkoutUrl, preferenceId } =
        await provider.createOneTimePayment(params);

      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          mpPreferenceId: preferenceId,
          method: "one_time",
          status: "pending",
        },
        update: {
          mpPreferenceId: preferenceId,
          method: "one_time",
          status: "pending",
        },
      });

      return NextResponse.json({ checkoutUrl });
    }

    const { checkoutUrl, subscriptionId } = await provider.createSubscription(
      params
    );

    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        mpSubscriptionId: subscriptionId,
        method: "subscription",
        status: "pending",
      },
      update: {
        mpSubscriptionId: subscriptionId,
        method: "subscription",
        status: "pending",
      },
    });

    return NextResponse.json({ checkoutUrl });
  } catch (e) {
    const detail = describeError(e);
    console.error("[checkout] Mercado Pago error:", detail, e);
    return NextResponse.json(
      { error: `Mercado Pago: ${detail}` },
      { status: 502 }
    );
  }
}
