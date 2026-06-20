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

export async function sendEmail(email: string, name: string, postCount?: number) {
  const resend = getResend();
  const detail =
    postCount && postCount > 0
      ? `${postCount} posts con guion completo: hook, desarrollo, CTA, caption y hashtags.`
      : "Tus posts con guion completo: hook, desarrollo, CTA, caption y hashtags.";

  await resend.emails.send({
    from: `Scripvox <${process.env.RESEND_FROM_EMAIL}>`,
    to: email,
    subject: `Tu calendario de esta semana está listo, ${name}`,
    html: `
      <div style="background:#fff0f6;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid rgba(61,24,40,0.12);">
          <div style="font-size:20px;font-weight:500;letter-spacing:-0.5px;margin:0 0 24px">
            <span style="color:#17090e">scrip</span><span style="color:#f0287e;font-style:italic">vox</span>
          </div>
          <h1 style="font-size:20px;font-weight:500;letter-spacing:-0.5px;color:#17090e;margin:0 0 12px">
            Hola ${name}, tu semana de contenido está lista
          </h1>
          <p style="color:#6b5560;line-height:1.6;font-size:15px;margin:0 0 24px">
            ${detail} Todo basado en temas tendencia de tu nicho, listo para grabar.
          </p>
          <a href="${APP_URL}/dashboard"
             style="display:inline-block;padding:14px 28px;background:#f0287e;color:#fff0f6;
                    text-decoration:none;border-radius:8px;font-weight:500;font-size:15px">
            Ver mi calendario →
          </a>
          <p style="margin-top:32px;font-size:12px;color:#9a8490">
            Scripvox ·
            <a href="${APP_URL}/dashboard/settings" style="color:#c4779e;text-decoration:none">Ajustes</a>
          </p>
        </div>
      </div>`,
  });
}

export async function sendWhatsApp(phone: string, name: string, postCount?: number) {
  const twilio = getTwilio();
  const formatted = formatPhone(phone);
  const detail =
    postCount && postCount > 0
      ? `${postCount} posts con guiones completos, listos para grabar.`
      : "Tus guiones completos, listos para grabar.";

  await twilio.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${formatted}`,
    body: `*Scripvox*\n\nHola ${name}, tu semana de contenido está lista. ${detail}\n\n👉 ${APP_URL}/dashboard`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
) {
  const resend = getResend();
  await resend.emails.send({
    from: `Scripvox <${process.env.RESEND_FROM_EMAIL}>`,
    to: email,
    subject: "Restablecé tu contraseña de Scripvox",
    html: `
      <div style="background:#fff0f6;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid rgba(61,24,40,0.12);">
          <div style="font-size:20px;font-weight:500;letter-spacing:-0.5px;margin:0 0 24px">
            <span style="color:#17090e">scrip</span><span style="color:#f0287e;font-style:italic">vox</span>
          </div>
          <h1 style="font-size:20px;font-weight:500;letter-spacing:-0.5px;color:#17090e;margin:0 0 12px">
            Hola ${name}, restablecé tu contraseña
          </h1>
          <p style="color:#6b5560;line-height:1.6;font-size:15px;margin:0 0 24px">
            Pediste cambiar tu contraseña. Tocá el botón para elegir una nueva. El link vence en una hora.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:14px 28px;background:#f0287e;color:#fff0f6;
                    text-decoration:none;border-radius:8px;font-weight:500;font-size:15px">
            Cambiar contraseña →
          </a>
          <p style="margin-top:24px;font-size:13px;color:#9a8490;line-height:1.6">
            Si no fuiste vos, ignorá este mensaje. Tu contraseña no cambia hasta que entres con el link.
          </p>
        </div>
      </div>`,
  });
}

export async function sendRenewalReminderEmail(
  email: string,
  name: string,
  renewUrl: string,
  daysLeft: number
) {
  const resend = getResend();
  const when = daysLeft === 1 ? "mañana" : `en ${daysLeft} días`;
  await resend.emails.send({
    from: `Scripvox <${process.env.RESEND_FROM_EMAIL}>`,
    to: email,
    subject: `Tu mes en Scripvox vence ${when}`,
    html: `
      <div style="background:#fff0f6;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid rgba(61,24,40,0.12);">
          <div style="font-size:20px;font-weight:500;letter-spacing:-0.5px;margin:0 0 24px">
            <span style="color:#17090e">scrip</span><span style="color:#f0287e;font-style:italic">vox</span>
          </div>
          <h1 style="font-size:20px;font-weight:500;letter-spacing:-0.5px;color:#17090e;margin:0 0 12px">
            Hola ${name}, tu mes vence ${when}
          </h1>
          <p style="color:#6b5560;line-height:1.6;font-size:15px;margin:0 0 24px">
            Renová tu acceso para seguir recibiendo tu calendario de contenido cada semana, sin cortes.
          </p>
          <a href="${renewUrl}"
             style="display:inline-block;padding:14px 28px;background:#f0287e;color:#fff0f6;
                    text-decoration:none;border-radius:8px;font-weight:500;font-size:15px">
            Renovar mi mes →
          </a>
          <p style="margin-top:24px;font-size:13px;color:#9a8490;line-height:1.6">
            Pagás con débito, crédito, efectivo o dinero en cuenta.
          </p>
        </div>
      </div>`,
  });
}

export async function sendRenewalReminderWhatsApp(
  phone: string,
  name: string,
  renewUrl: string,
  daysLeft: number
) {
  const twilio = getTwilio();
  const formatted = formatPhone(phone);
  const when = daysLeft === 1 ? "mañana" : `en ${daysLeft} días`;
  await twilio.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${formatted}`,
    body: `*Scripvox*\n\nHola ${name}, tu mes vence ${when}. Renová para no perder tu contenido.\n\n👉 ${renewUrl}`,
  });
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("54")) return `+${digits}`;
  if (digits.startsWith("0")) return `+54${digits.slice(1)}`;
  return `+549${digits}`;
}
