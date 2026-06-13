"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CalendarStatus = "generating" | "ready" | "error";

type Post = {
  id: string;
  day: string;
  platform: string;
  pillar: string;
  title: string;
  hook: string;
};

type CalendarResponse = {
  calendar: {
    id: string;
    status: CalendarStatus;
    weekStart: string;
    errorMessage?: string | null;
    posts: Post[];
  } | null;
};

const DAY_ORDER = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function DashboardPage() {
  const [calendar, setCalendar] = useState<CalendarResponse["calendar"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchCalendar = async () => {
      const res = await fetch("/api/calendar/current");
      if (res.ok) {
        const data: CalendarResponse = await res.json();
        setCalendar(data.calendar);
      }
      setLoading(false);
      timer = setTimeout(fetchCalendar, 3000);
    };

    fetchCalendar();
    return () => clearTimeout(timer);
  }, []);

  const postsByDay = useMemo(() => {
    if (!calendar?.posts) return {};
    return calendar.posts.reduce<Record<string, Post[]>>((acc, post) => {
      acc[post.day] = acc[post.day] ?? [];
      acc[post.day].push(post);
      return acc;
    }, {});
  }, [calendar]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-gray-600">Cargando tu calendario...</p>
      </main>
    );
  }

  if (!calendar) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Todavía no hay contenido</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vamos a generarlo el próximo viernes por la tarde.
        </p>
      </main>
    );
  }

  if (calendar.status === "generating") {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Estamos generando tu semana</h1>
        <p className="mt-2 text-sm text-gray-600">
          Esto puede demorar unos minutos. Actualizamos automáticamente.
        </p>
      </main>
    );
  }

  if (calendar.status === "error") {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Hubo un problema</h1>
        <p className="mt-2 text-sm text-gray-600">
          {calendar.errorMessage ?? "No pudimos generar tu contenido."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tu calendario semanal</h1>
          <p className="text-sm text-gray-600">
            Contenido basado en tendencias reales, listo para publicar.
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-sm font-medium text-black"
        >
          Ajustes
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {DAY_ORDER.filter((day) => postsByDay[day]?.length).map((day) => (
          <section
            key={day}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <h2 className="text-lg font-semibold">{day}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {postsByDay[day].map((post) => (
                <Link
                  key={post.id}
                  href={`/dashboard/post/${post.id}`}
                  className="rounded-md border border-gray-200 p-3 transition hover:border-black"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {post.platform} · {post.pillar}
                  </p>
                  <p className="mt-2 text-sm font-medium">{post.title}</p>
                  <p className="mt-1 text-xs text-gray-600">{post.hook}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
