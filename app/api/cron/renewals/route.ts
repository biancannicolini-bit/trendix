import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendRenewalReminderEmail,
  sendRenewalReminderWhatsApp,
} from "@/lib/notifications";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const reminderWindow = new Date(now.getTime() + 3 * DAY_MS);

  // 1. Vencer accesos de pago único que ya pasaron su fecha.
  const expired = await prisma.subscription.updateMany({
    where: {
      method: "one_time",
      status: "authorized",
      accessUntil: { lt: now },
    },
    data: { status: "expired" },
  });

  // 2. Recordar a quienes vencen dentro de 3 días y no avisamos aún.
  const toRemind = await prisma.subscription.findMany({
    where: {
      method: "one_time",
      status: "authorized",
      accessUntil: { gt: now, lte: reminderWindow },
      renewalReminderAt: null,
    },
    include: { user: true },
  });

  const renewUrl = `${process.env.NEXT_PUBLIC_URL}/onboarding/payment`;

  for (const sub of toRemind) {
    const daysLeft = Math.max(
      1,
      Math.ceil((sub.accessUntil!.getTime() - now.getTime()) / DAY_MS)
    );

    await Promise.allSettled([
      sendRenewalReminderEmail(sub.user.email, sub.user.name, renewUrl, daysLeft),
      sendRenewalReminderWhatsApp(sub.user.phone, sub.user.name, renewUrl, daysLeft),
    ]);

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { renewalReminderAt: now },
    });
  }

  return NextResponse.json({
    expired: expired.count,
    reminded: toRemind.length,
  });
}
