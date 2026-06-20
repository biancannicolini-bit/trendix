import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { triggerUserGeneration } from "@/lib/generation";
import MercadoPagoConfig, { PreApproval, Payment } from "mercadopago";

function getMp() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN no configurada");
  return new MercadoPagoConfig({ accessToken: token });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    if (body.type === "subscription_preapproval") {
      return await handlePreapproval(body);
    }
    if (body.type === "payment") {
      return await handlePayment(body);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("MP webhook error:", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

/** Suscripción con crédito (preapproval): activación y cambios de estado. */
async function handlePreapproval(body: { data?: { id?: string } }) {
  const preapprovalId = body.data?.id;
  if (!preapprovalId) return NextResponse.json({ ok: true });

  const mp = getMp();
  const pa = new PreApproval(mp);
  const sub = await pa.get({ id: preapprovalId });
  const userId = sub.external_reference!;
  const status = sub.status!;

  const existing = await prisma.subscription.findUnique({ where: { userId } });

  let mappedStatus = status;
  if (status === "cancelled" && existing?.cancelAt) {
    mappedStatus = existing.cancelAt > new Date() ? "cancelling" : "cancelled";
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      mpSubscriptionId: preapprovalId,
      method: "subscription",
      status: mappedStatus,
      nextBillingDate: sub.next_payment_date
        ? new Date(sub.next_payment_date)
        : null,
    },
    update: {
      method: "subscription",
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
}

/** Pago único con Checkout Pro (débito/efectivo/etc.): otorga 30 días de acceso. */
async function handlePayment(body: { data?: { id?: string } }) {
  const paymentId = body.data?.id;
  if (!paymentId) return NextResponse.json({ ok: true });

  const mp = getMp();
  const payment = await new Payment(mp).get({ id: String(paymentId) });

  if (payment.status !== "approved") {
    return NextResponse.json({ ok: true });
  }

  const userId = payment.external_reference;
  if (!userId) return NextResponse.json({ ok: true });

  const existing = await prisma.subscription.findUnique({ where: { userId } });

  // Idempotencia: si ya procesamos este pago, no extendemos de nuevo.
  if (existing?.lastPaymentId === String(paymentId)) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date();
  const base =
    existing?.accessUntil && existing.accessUntil > now
      ? existing.accessUntil
      : now;
  const accessUntil = new Date(base);
  accessUntil.setDate(accessUntil.getDate() + 30);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: "authorized",
      method: "one_time",
      accessUntil,
      lastPaymentId: String(paymentId),
    },
    update: {
      status: "authorized",
      method: "one_time",
      accessUntil,
      lastPaymentId: String(paymentId),
      renewalReminderAt: null,
    },
  });

  triggerUserGeneration(userId);
  return NextResponse.json({ ok: true });
}
