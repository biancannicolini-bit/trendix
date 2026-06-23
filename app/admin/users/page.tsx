"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  subscription: {
    status: string;
    method: string;
    accessUntil: string | null;
  } | null;
  calendarCount: number;
  aiCostThisMonth: number;
};

function methodLabel(sub: UserRow["subscription"]) {
  if (!sub) return "—";
  return sub.method === "one_time" ? "Débito" : "Crédito";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetch(`/api/admin/users?page=${page}&status=${status}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users ?? []);
        setPages(d.pages ?? 1);
      });
  }, [page, status]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-[28px] font-medium tracking-[-0.5px]">Usuarios</h1>
          <p className="text-sm text-text-secondary">
            {users.length} en esta página
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-[var(--color-border-tertiary)] bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-pink"
        >
          <option value="all">Todos</option>
          <option value="authorized">Activos</option>
          <option value="pending">Pendientes</option>
          <option value="cancelling">Cancelando</option>
          <option value="cancelled">Cancelados</option>
          <option value="expired">Vencidos</option>
          <option value="payment_failed">Pago fallido</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border-tertiary)] bg-bg-secondary">
            <tr className="text-text-secondary">
              <th className="px-4 py-2.5 font-medium">Nombre</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium">Método</th>
              <th className="px-4 py-2.5 font-medium">Calendarios</th>
              <th className="px-4 py-2.5 font-medium">Costo IA</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--color-border-tertiary)] text-text-primary last:border-0"
              >
                <td className="px-4 py-2.5">{user.name}</td>
                <td className="px-4 py-2.5 text-text-secondary">{user.email}</td>
                <td className="px-4 py-2.5">
                  {user.subscription?.status ?? "sin suscripción"}
                </td>
                <td className="px-4 py-2.5 text-text-secondary">
                  {methodLabel(user.subscription)}
                </td>
                <td className="px-4 py-2.5">{user.calendarCount}</td>
                <td className="px-4 py-2.5 text-text-secondary">
                  ${user.aiCostThisMonth.toFixed(4)}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-medium text-brand-pink hover:opacity-80"
                  >
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-[var(--color-border-secondary)] disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-2 py-1 text-sm text-text-tertiary">
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-[var(--color-border-secondary)] disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
