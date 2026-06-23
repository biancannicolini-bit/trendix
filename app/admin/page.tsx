"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  activeUsers: number;
  totalUsers: number;
  newThisWeek: number;
  mrr: number;
  aiCostUsd: number;
  tokensUsed: number;
  cronErrors: number;
  churnThisMonth: number;
};

type GenerationError = {
  id: string;
  userId: string;
  errorType: string;
  errorMessage: string;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [errors, setErrors] = useState<GenerationError[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
    fetch("/api/admin/errors")
      .then((r) => r.json())
      .then((d) => setErrors(d.errors ?? []));
  }, []);

  if (!stats) {
    return <p className="text-sm text-text-secondary">Cargando métricas...</p>;
  }

  const costPerActive =
    stats.activeUsers > 0 ? stats.aiCostUsd / stats.activeUsers : 0;

  const cards = [
    { label: "Usuarios activos", value: stats.activeUsers, accent: true },
    { label: "Total usuarios", value: stats.totalUsers },
    { label: "Nuevos esta semana", value: stats.newThisWeek },
    { label: "Ingresos activos (ARS)", value: `$${stats.mrr.toLocaleString("es-AR")}`, accent: true },
    { label: "Costo IA (USD/mes)", value: `$${stats.aiCostUsd.toFixed(4)}` },
    { label: "Costo IA / activo (USD)", value: `$${costPerActive.toFixed(4)}` },
    { label: "Tokens (mes)", value: stats.tokensUsed.toLocaleString("es-AR") },
    { label: "Churn (mes)", value: stats.churnThisMonth },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-1">
        <h1 className="text-[28px] font-medium tracking-[-0.5px]">Métricas</h1>
        <p className="text-sm text-text-secondary">Resumen del negocio</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary p-4 shadow-[0_1px_2px_rgba(23,9,14,0.04)]"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              {card.label}
            </p>
            <p
              className={`mt-2 text-2xl font-medium ${card.accent ? "text-brand-pink" : "text-text-primary"}`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-tertiary">
        El costo de IA es de Anthropic (no incluye la comisión de Mercado Pago).
        Ingresos en ARS, costo en USD — no es un margen directo.
      </p>

      <section className="space-y-4">
        <h2 className="text-lg font-medium tracking-[-0.5px]">
          Errores recientes
        </h2>
        {errors.length === 0 ? (
          <p className="text-sm text-text-secondary">Sin errores pendientes.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border-tertiary)] bg-bg-secondary">
                <tr className="text-text-secondary">
                  <th className="px-4 py-2.5 font-medium">Fecha</th>
                  <th className="px-4 py-2.5 font-medium">Usuario</th>
                  <th className="px-4 py-2.5 font-medium">Tipo</th>
                  <th className="px-4 py-2.5 font-medium">Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err) => (
                  <tr
                    key={err.id}
                    className="border-b border-[var(--color-border-tertiary)] text-text-primary last:border-0"
                  >
                    <td className="px-4 py-2.5 text-text-secondary">
                      {new Date(err.createdAt).toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/users/${err.userId}`}
                        className="font-medium text-brand-pink hover:opacity-80"
                      >
                        Ver
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">{err.errorType}</td>
                    <td className="max-w-xs truncate px-4 py-2.5 text-text-secondary">
                      {err.errorMessage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
