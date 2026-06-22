import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { triggerUserGeneration } from "@/lib/generation";
import MercadoPagoConfig, { PreApproval, Payment } from "mercadopago";

function getMp() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN no configurada");
  return new MercadoPagoConfig({ accessToken: token });
}

/**
 * Valida la firma del webhook (HMAC-SHA256) según MP.
 * Kill-switch: si no hay MP_WEBHOOK_SECRET, no valida (rollout gradual / desactivar).
 */
function verifySignature(req: NextRequest): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts: Record<string, string> = {};
  for (const segment of xSignature.split(",")) {
    const [k, v] = segment.split("=").map((s) => s.trim());
    if (k && v) parts[k] = v;
  }
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const dataId = (req.nextUrl.searchParams.get("data.id") ?? "").toLowerCase();
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const computed = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  try {
    const ok = crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(v1)
    );
    if (!ok) {
      console.warn("[mp-webhook] firma no coincide", { computed, v1, manifest });
    }
    return ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!verifySignature(req)) {
    console.warn("[mp-webhook] firma inválida — rechazado");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

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
