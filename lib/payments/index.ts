import { MercadoPagoProvider } from "./mercadopago";

const providers = { mercadopago: MercadoPagoProvider };

export function getPaymentProvider(method: string) {
  const p = providers[method as keyof typeof providers];
  if (!p) throw new Error(`Provider desconocido: ${method}`);
  return p;
}
