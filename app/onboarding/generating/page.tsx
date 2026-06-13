"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingGeneratingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("generating");

  useEffect(() => {
    const poll = async () => {
      const res = await fetch("/api/calendar/current");
      if (!res.ok) return;

      const { calendar } = await res.json();
      if (!calendar) return;

      setStatus(calendar.status);

      if (calendar.status === "ready") {
        router.push("/dashboard");
      }
      if (calendar.status === "error") {
        router.push("/dashboard");
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Preparando tu contenido</h1>
        <p className="text-sm text-gray-600">
          {status === "generating"
            ? "Estamos generando tu primera semana con tendencias reales. Esto puede demorar unos minutos."
            : "Procesando..."}
        </p>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
      </div>
    </main>
  );
}
