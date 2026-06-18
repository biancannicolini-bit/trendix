import MercadoPagoConfig, { PreApproval } from "mercadopago";
import type { PaymentProvider } from "./types";

function getMp() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN no configurada");
  return new MercadoPagoConfig({ accessToken: token });
}

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
        back_url: `${process.env.NEXT_PUBLIC_URL}/onboarding/generating`,
        status: "pending",
      },
    });
    return { checkoutUrl: res.init_point!, subscriptionId: res.id! };
  },
  async cancelSubscription(id) {
    const mp = getMp();
    const pa = new PreApproval(mp);
    await pa.update({ id, body: { status: "cancelled" } });
  },
};
