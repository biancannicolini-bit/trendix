import MercadoPagoConfig, { PreApproval, Preference } from "mercadopago";
import type { PaymentProvider } from "./types";

function getMp() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN no configurada");
  return new MercadoPagoConfig({ accessToken: token });
}

const APP_URL = process.env.NEXT_PUBLIC_URL;

export const MercadoPagoProvider: PaymentProvider = {
  name: "mercadopago",
  async createSubscription({ userId, userEmail }) {
    const mp = getMp();
    const pa = new PreApproval(mp);
    const res = await pa.create({
      body: {
        reason: "Scripvox — Plan Mensual",
        external_reference: userId,
        payer_email: userEmail,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 15000,
          currency_id: "ARS",
        },
        back_url: `${APP_URL}/onboarding/generating`,
        status: "pending",
      },
    });
    return { checkoutUrl: res.init_point!, subscriptionId: res.id! };
  },
  async createOneTimePayment({ userId, userEmail }) {
    const mp = getMp();
    const pref = new Preference(mp);
    const res = await pref.create({
      body: {
        items: [
          {
            id: "scripvox-mensual",
            title: "Scripvox — Acceso mensual",
            quantity: 1,
            unit_price: 15000,
            currency_id: "ARS",
          },
        ],
        payer: { email: userEmail },
        external_reference: userId,
        back_urls: {
          success: `${APP_URL}/onboarding/generating`,
          pending: `${APP_URL}/onboarding/generating`,
          failure: `${APP_URL}/onboarding/payment`,
        },
        auto_return: "approved",
        notification_url: `${APP_URL}/api/webhooks/mercadopago`,
        metadata: { user_id: userId },
      },
    });
    return { checkoutUrl: res.init_point!, preferenceId: res.id! };
  },
  async cancelSubscription(id) {
    const mp = getMp();
    const pa = new PreApproval(mp);
    await pa.update({ id, body: { status: "cancelled" } });
  },
};
