import { Resend } from "resend";
import Twilio from "twilio";

const APP_URL = process.env.NEXT_PUBLIC_URL;

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY no configurada");
  return new Resend(key);
}

function getTwilio() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio no configurado");
  return Twilio(sid, token);
}

export async function sendEmail(email: string, name: string) {
  const resend = getResend();
  await resend.emails.send({
    from: `TrendContent <${process.env.RESEND_FROM_EMAIL}>`,
    to: email,
    subject: `🎬 Tu contenido de esta semana está listo, ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="font-size:20px;margin:0 0 12px">Hola ${name} 👋</h2>
        <p style="color:#555;line-height:1.6;margin:0 0 20px">
          Tu calendario de contenido para esta semana ya está listo con guiones completos,
          hooks y captions basados en tendencias reales de tu nicho.
        </p>
        <a href="${APP_URL}/dashboard"
           style="display:inline-block;padding:12px 24px;background:#000;color:#fff;
                  text-decoration:none;border-radius:8px;font-weight:500">
          Ver mi calendario →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#aaa">
          TrendContent ·
          <a href="${APP_URL}/dashboard/settings" style="color:#aaa">Ajustes</a>
        </p>
      </div>`,
  });
}

export async function sendWhatsApp(phone: string, name: string) {
  const twilio = getTwilio();
  const formatted = formatPhone(phone);
  await twilio.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${formatted}`,
    body: `🎬 *TrendContent*\n\nHola ${name}! Tu calendario de contenido de esta semana ya está listo con guiones completos.\n\n👉 ${APP_URL}/dashboard`,
  });
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("54")) return `+${digits}`;
  if (digits.startsWith("0")) return `+54${digits.slice(1)}`;
  return `+549${digits}`;
}
