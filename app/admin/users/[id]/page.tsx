"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type UserDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  profile: {
    niche: string;
    location: string;
    platforms: string[];
    frequency: number;
  } | null;
  subscription: {
    status: string;
    method: string;
    amount: number;
    currency: string;
    accessUntil: string | null;
    nextBillingDate: string | null;
  } | null;
  calendars: {
    id: string;
    weekStart: string;
    status: string;
    generatedAt: string;
    costUsd: number | null;
    postCount: number;
  }[];
  aiCostThisMonth: number;
  tokensThisMonth: number;
};

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("es-AR") : "—";
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${params.id}`)
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null));
  }, [params.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch(`/api/admin/users/${params.id}/generate`, {
      method: "POST",
    });
    setGenerating(false);

    if (!res.ok) {
      toast.error("No se pudo disparar la generación");
      return;
    }
    toast.success("Generación iniciada");
  };

  if (!user) {
    return <p className="text-sm text-text-secondary">Cargando usuario...</p>;
  }

  const sub = user.subscription;
  const method = sub ? (sub.method === "one_time" ? "Débito (pago único)" : "Crédito (suscripción)") : "—";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Link
        href="/admin/users"
        className="inline-flex text-sm font-medium text-text-secondary transition-colors hover:text-brand-pink"
      >
        ← Volver a usuarios
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-[26px] font-medium tracking-[-0.5px]">
            {user.name}
          </h1>
          <p className="text-sm text-text-secondary">{user.email}</p>
          <p className="text-sm text-text-secondary">{user.phone}</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-md bg-brand-pink px-4 py-2 text-sm font-medium text-brand-light transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {generating ? "Generando..." : "Generar calendario ahora"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Suscripción" value={sub?.status ?? "sin suscripción"} />
        <Stat label="Método" value={method} />
        <Stat label="Costo IA (mes)" value={`$${user.aiCostThisMonth.toFixed(4)}`} />
        <Stat label="Tokens (mes)" value={user.tokensThisMonth.toLocaleString("es-AR")} />
        {sub?.method === "one_time" && (
          <Stat label="Acceso hasta" value={fmtDate(sub.accessUntil)} />
        )}
        {sub?.method !== "one_time" && sub && (
          <Stat label="Próximo cobro" value={fmtDate(sub.nextBillingDate)} />
        )}
      </div>

      {user.profile && (
        <section className="rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary p-4">
          <h2 className="font-medium tracking-[-0.5px]">Perfil</h2>
          <div className="mt-2 grid gap-1 text-sm text-text-secondary">
            <p>Nicho: {user.profile.niche}</p>
            <p>Ubicación: {user.profile.location}</p>
            <p>Plataformas: {user.profile.platforms.join(", ")}</p>
            <p>Frecuencia: {user.profile.frequency} posts/semana</p>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium tracking-[-0.5px]">
          Calendarios recientes
        </h2>
        {user.calendars.length === 0 ? (
          <p className="text-sm text-text-secondary">Sin calendarios.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border-tertiary)] bg-bg-secondary">
                <tr className="text-text-secondary">
                  <th className="px-4 py-2.5 font-medium">Semana</th>
                  <th className="px-4 py-2.5 font-medium">Estado</th>
                  <th className="px-4 py-2.5 font-medium">Posts</th>
                  <th className="px-4 py-2.5 font-medium">Costo</th>
                  <th className="px-4 py-2.5 font-medium">Generado</th>
                </tr>
              </thead>
              <tbody>
                {user.calendars.map((cal) => (
                  <tr
                    key={cal.id}
                    className="border-b border-[var(--color-border-tertiary)] text-text-primary last:border-0"
                  >
                    <td className="px-4 py-2.5">
                      {new Date(cal.weekStart).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2.5">{cal.status}</td>
                    <td className="px-4 py-2.5">{cal.postCount}</td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      {cal.costUsd != null ? `$${cal.costUsd.toFixed(4)}` : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      {new Date(cal.generatedAt).toLocaleString("es-AR")}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
        {label}
      </p>
      <p className="mt-1 font-medium text-text-primary">{value}</p>
    </div>
  );
}
