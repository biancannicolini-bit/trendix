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
    amount: number;
    currency: string;
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
    return <p className="text-sm text-gray-600">Cargando usuario...</p>;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm text-gray-600">
        ← Volver a usuarios
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-600">{user.phone}</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {generating ? "Generando..." : "Generar calendario ahora"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Suscripción</p>
          <p className="mt-1 font-medium">
            {user.subscription?.status ?? "sin suscripción"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Costo IA (mes)</p>
          <p className="mt-1 font-medium">${user.aiCostThisMonth.toFixed(4)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Tokens (mes)</p>
          <p className="mt-1 font-medium">
            {user.tokensThisMonth.toLocaleString()}
          </p>
        </div>
      </div>

      {user.profile && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold">Perfil</h2>
          <div className="mt-2 grid gap-1 text-sm text-gray-700">
            <p>Nicho: {user.profile.niche}</p>
            <p>Ubicación: {user.profile.location}</p>
            <p>Plataformas: {user.profile.platforms.join(", ")}</p>
            <p>Frecuencia: {user.profile.frequency} posts/semana</p>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Calendarios recientes</h2>
        {user.calendars.length === 0 ? (
          <p className="text-sm text-gray-600">Sin calendarios.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Semana</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Posts</th>
                  <th className="px-4 py-2">Costo</th>
                  <th className="px-4 py-2">Generado</th>
                </tr>
              </thead>
              <tbody>
                {user.calendars.map((cal) => (
                  <tr key={cal.id} className="border-b border-gray-100">
                    <td className="px-4 py-2">
                      {new Date(cal.weekStart).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2">{cal.status}</td>
                    <td className="px-4 py-2">{cal.postCount}</td>
                    <td className="px-4 py-2">
                      {cal.costUsd != null ? `$${cal.costUsd.toFixed(4)}` : "-"}
                    </td>
                    <td className="px-4 py-2">
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
