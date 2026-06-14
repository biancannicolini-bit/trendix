"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COPY } from "@/lib/copy";
import { BRAND } from "@/lib/brand";

export default function OnboardingPaymentPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "mercadopago" }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "No pudimos iniciar el pago");
      setIsLoading(false);
      return;
    }

    const data = await res.json();
    if (!data.checkoutUrl) {
      toast.error("No se pudo iniciar el pago");
      setIsLoading(false);
      return;
    }

    window.location.href = data.checkoutUrl;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <h1 className="text-[28px] font-medium tracking-[-0.5px]">
          Activar suscripción
        </h1>
        <p className="text-sm text-text-secondary">
          Pagás {COPY.planPrice}. Cancelás cuando quieras.
        </p>
      </div>

      <Card variant="featured" className="p-0">
        <div className="space-y-2 p-6" style={{ background: BRAND.DARK }}>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-brand-pink">
            Plan mensual
          </p>
          <p
            className="text-[32px] font-medium tracking-[-1px]"
            style={{ color: BRAND.LIGHT }}
          >
            {COPY.planPrice}
          </p>
        </div>

        <div className="space-y-4 p-6">
          <ul className="space-y-2">
            {COPY.planFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-text-secondary"
              >
                <span className="mt-0.5 text-brand-pink">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-2.5 text-sm text-text-secondary">
            Mercado Pago
          </div>

          <Button type="button" onClick={handleCheckout} disabled={isLoading}>
            {isLoading ? "Redirigiendo..." : "Continuar con Mercado Pago"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
