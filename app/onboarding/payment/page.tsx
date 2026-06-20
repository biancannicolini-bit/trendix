"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COPY } from "@/lib/copy";
import { BRAND } from "@/lib/brand";

type Mode = "subscription" | "one_time";

export default function OnboardingPaymentPage() {
  const [loadingMode, setLoadingMode] = useState<Mode | null>(null);

  const handleCheckout = async (mode: Mode) => {
    setLoadingMode(mode);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "No pudimos iniciar el pago");
      setLoadingMode(null);
      return;
    }

    const data = await res.json();
    if (!data.checkoutUrl) {
      toast.error("No se pudo iniciar el pago");
      setLoadingMode(null);
      return;
    }

    window.location.href = data.checkoutUrl;
  };

  const busy = loadingMode !== null;

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

        <div className="space-y-5 p-6">
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

          <div className="space-y-2">
            <Button
              type="button"
              onClick={() => handleCheckout("subscription")}
              disabled={busy}
            >
              {loadingMode === "subscription"
                ? "Redirigiendo..."
                : "Suscribirme con tarjeta de crédito"}
            </Button>
            <p className="text-center text-xs text-text-tertiary">
              Se renueva solo cada mes. Cancelás cuando quieras.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-text-tertiary">
            <span className="h-px flex-1 bg-[var(--color-border-tertiary)]" />
            o
            <span className="h-px flex-1 bg-[var(--color-border-tertiary)]" />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleCheckout("one_time")}
              disabled={busy}
            >
              {loadingMode === "one_time"
                ? "Redirigiendo..."
                : "Pagar con débito u otro medio"}
            </Button>
            <p className="text-center text-xs text-text-tertiary">
              Débito, efectivo o dinero en cuenta. Te avisamos antes de que venza
              para que lo renueves.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
