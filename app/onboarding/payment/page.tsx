"use client";

import { useState } from "react";
import { toast } from "sonner";

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
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Activar suscripción</h1>
          <p className="text-sm text-gray-600">
            Pagás ARS $15.000/mes. Podés cancelar cuando quieras.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-1">
            <p className="text-sm font-medium">Método de pago</p>
            <div className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              Mercado Pago
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isLoading ? "Redirigiendo..." : "Continuar con Mercado Pago"}
          </button>
        </div>
      </div>
    </main>
  );
}
