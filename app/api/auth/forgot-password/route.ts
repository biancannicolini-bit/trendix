import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/notifications";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Ingresá tu email." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Un solo token activo por usuario.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (e) {
      console.error("[forgot-password] no se pudo enviar el email:", e);
    }
  }

  // Respuesta uniforme: no revelamos si el email está registrado.
  return NextResponse.json({ ok: true });
}
