"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  subscription: { status: string } | null;
  calendarCount: number;
  aiCostThisMonth: number;
  lastCalendar: { status: string; generatedAt: string } | null;
};

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-sm text-gray-600">{users.length} en esta página</p>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">Todos</option>
          <option value="authorized">Activos</option>
          <option value="pending">Pendientes</option>
          <option value="cancelling">Cancelando</option>
          <option value="cancelled">Cancelados</option>
          <option value="payment_failed">Pago fallido</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Calendarios</th>
              <th className="px-4 py-2">Costo IA</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  {user.subscription?.status ?? "sin suscripción"}
                </td>
                <td className="px-4 py-2">{user.calendarCount}</td>
                <td className="px-4 py-2">
                  ${user.aiCostThisMonth.toFixed(4)}
                </td>
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-medium text-black"
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
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-2 py-1 text-sm text-gray-600">
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
