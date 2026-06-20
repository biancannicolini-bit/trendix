"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function OnboardingGeneratingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [status, setStatus] = useState<string>("generating");

  useEffect(() => {
    const goToDashboard = async () => {
      // Refresca el token (el pago ya cambió el estado en la DB) antes de
      // entrar, así el middleware no rebota al usuario a la pantalla de pago.
      await update().catch(() => {});
      router.push("/dashboard");
    };

    const poll = async () => {
      await fetch("/api/generation/start", { method: "POST" }).catch(() => {});

      const res = await fetch("/api/calendar/current");
      if (!res.ok) return;

      const { calendar } = await res.json();
      if (!calendar) return;

      setStatus(calendar.status);

      if (calendar.status === "ready" || calendar.status === "error") {
        await goToDashboard();
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [router, update]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md space-y-5 text-center animate-fade-in-up">
        <Spinner className="mx-auto" />
        <div className="space-y-2">
          <h1 className="text-[22px] font-medium tracking-[-0.5px]">
            Preparando tu contenido
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">
            {status === "generating"
              ? "Estamos generando tu primera semana con trends reales. Esto puede demorar unos minutos."
              : "Procesando..."}
          </p>
        </div>
      </Card>
    </div>
  );
}
