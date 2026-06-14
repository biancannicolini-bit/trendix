import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { triggerUserGeneration } from "@/lib/generation";
import MercadoPagoConfig, { PreApproval } from "mercadopago";

function getMp() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN no configurada");
  return new MercadoPagoConfig({ accessToken: token });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.type !== "subscription_preapproval") {
    return NextResponse.json({ ok: true });
  }

  const preapprovalId = body.data?.id;
  if (!preapprovalId) return NextResponse.json({ ok: true });

  try {
    const mp = getMp();
    const pa = new PreApproval(mp);
    const sub = await pa.get({ id: preapprovalId });
    const userId = sub.external_reference!;
    const status = sub.status!;

    const existing = await prisma.subscription.findUnique({ where: { userId } });

    let mappedStatus = status;
    if (status === "cancelled" && existing?.cancelAt) {
      mappedStatus =
        existing.cancelAt > new Date() ? "cancelling" : "cancelled";
    }

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        mpSubscriptionId: preapprovalId,
        status: mappedStatus,
        nextBillingDate: sub.next_payment_date
          ? new Date(sub.next_payment_date)
          : null,
      },
      update: {
        status: mappedStatus,
        nextBillingDate: sub.next_payment_date
          ? new Date(sub.next_payment_date)
          : null,
        ...(mappedStatus === "cancelled" ? { cancelAt: new Date() } : {}),
      },
    });

    if (status === "authorized") {
      triggerUserGeneration(userId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("MP webhook error:", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
