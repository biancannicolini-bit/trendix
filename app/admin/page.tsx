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
    return <p className="text-sm text-gray-600">Cargando métricas...</p>;
  }

  const cards = [
    { label: "Usuarios activos", value: stats.activeUsers },
    { label: "Total usuarios", value: stats.totalUsers },
    { label: "Nuevos esta semana", value: stats.newThisWeek },
    { label: "MRR (ARS)", value: `$${stats.mrr.toLocaleString()}` },
    { label: "Costo IA (USD/mes)", value: `$${stats.aiCostUsd.toFixed(4)}` },
    { label: "Tokens (mes)", value: stats.tokensUsed.toLocaleString() },
    { label: "Errores cron (7d)", value: stats.cronErrors },
    { label: "Churn (mes)", value: stats.churnThisMonth },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Métricas</h1>
        <p className="text-sm text-gray-600">Resumen del negocio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Errores recientes</h2>
        {errors.length === 0 ? (
          <p className="text-sm text-gray-600">Sin errores pendientes.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Usuario</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err) => (
                  <tr key={err.id} className="border-b border-gray-100">
                    <td className="px-4 py-2">
                      {new Date(err.createdAt).toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/users/${err.userId}`}
                        className="text-black underline"
                      >
                        Ver
                      </Link>
                    </td>
                    <td className="px-4 py-2">{err.errorType}</td>
                    <td className="max-w-xs truncate px-4 py-2">
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
