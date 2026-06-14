"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/Spinner";

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
  const router = useRouter();
  const [calendar, setCalendar] = useState<CalendarResponse["calendar"]>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const kickoffAttempted = useRef(false);

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

  useEffect(() => {
    if (loading || calendar || kickoffAttempted.current) return;
    kickoffAttempted.current = true;

    void fetch("/api/generation/start", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data.started) router.push("/onboarding/generating");
      })
      .catch(() => {});
  }, [loading, calendar, router]);

  const retryGeneration = async () => {
    setRetrying(true);
    await fetch("/api/generation/start", { method: "POST" }).catch(() => {});
    router.push("/onboarding/generating");
  };

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
      <LoadingState
        title="Cargando tu calendario"
        description="Un momento mientras buscamos tu semana de contenido."
      />
    );
  }

  if (!calendar) {
    return (
      <LoadingState
        title="Armando tu primera semana"
        description="Estamos generando contenido con trends reales. Si tarda más de unos minutos, revisá que la suscripción esté activa."
      />
    );
  }

  if (calendar.status === "generating") {
    return (
      <LoadingState
        title="Generando tu semana"
        description="Esto puede demorar unos minutos. Actualizamos automáticamente."
      />
    );
  }

  if (calendar.status === "error") {
    return <GenerationErrorPanel calendar={calendar} onRetry={retryGeneration} retrying={retrying} />;
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up space-y-2">
        <h1 className="text-[28px] font-medium tracking-[-0.5px]">
          Tu calendario semanal
        </h1>
        <p className="text-sm text-text-secondary">
          Contenido basado en tendencias reales, listo para grabar.
        </p>
      </div>

      <div className="grid gap-4">
        {DAY_ORDER.filter((day) => postsByDay[day]?.length).map(
          (day, index) => (
            <section
              key={day}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <Card className="space-y-4">
                <h2 className="text-lg font-medium tracking-[-0.5px]">{day}</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {postsByDay[day].map((post) => (
                    <Link
                      key={post.id}
                      href={`/dashboard/post/${post.id}`}
                      className="group rounded-md border border-[var(--color-border-tertiary)] p-4 transition-all duration-200 hover:border-brand-pink/50 hover:shadow-[0_4px_20px_rgba(240,40,126,0.08)]"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{post.pillar}</Badge>
                        <span className="text-[11px] text-text-tertiary">
                          {post.platform}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-medium leading-snug text-text-primary">
                        {post.title}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                        {post.hook}
                      </p>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>
          )
        )}
      </div>
    </div>
  );
}

type DiagnoseResponse = {
  checks: Array<{ name: string; ok: boolean; error?: string; anthropic_configured?: boolean }>;
  lastError: { errorMessage: string; createdAt: string } | null;
  appConfigured: { pythonUrl: string; hasInternalKey: boolean };
};

function GenerationErrorPanel({
  calendar,
  onRetry,
  retrying,
}: {
  calendar: NonNullable<CalendarResponse["calendar"]>;
  onRetry: () => void;
  retrying: boolean;
}) {
  const [diagnose, setDiagnose] = useState<DiagnoseResponse | null>(null);

  useEffect(() => {
    void fetch("/api/generation/diagnose")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDiagnose(data))
      .catch(() => {});
  }, []);

  const pythonCheck = diagnose?.checks.find((c) => c.name === "python_health");
  const detail =
    calendar.errorMessage ??
    diagnose?.lastError?.errorMessage ??
    "No pudimos generar tu contenido.";

  return (
    <div className="animate-fade-in-up max-w-lg space-y-5">
      <div className="space-y-3">
        <h1 className="text-[22px] font-medium tracking-[-0.5px]">Algo falló</h1>
        <p className="text-sm leading-relaxed text-text-secondary">{detail}</p>
      </div>

      {diagnose && (
        <Card className="space-y-3 bg-bg-secondary text-[13px]">
          <p className="font-medium text-text-primary">Diagnóstico rápido</p>
          <ul className="space-y-1.5 text-text-secondary">
            <li>
              Python:{" "}
              {pythonCheck?.ok ? "conectado" : "no responde"}
              {pythonCheck?.anthropic_configured === false &&
                " · API key de Anthropic faltante en trendix_python"}
            </li>
            <li>
              App → Python:{" "}
              {diagnose.appConfigured.hasInternalKey
                ? "configurada"
                : "INTERNAL_API_KEY faltante en trendix_app"}
            </li>
            {pythonCheck?.error && (
              <li className="break-words text-red-700">{pythonCheck.error}</li>
            )}
          </ul>
        </Card>
      )}

      <Button
        type="button"
        className="max-w-xs"
        disabled={retrying}
        onClick={onRetry}
      >
        {retrying ? "Reintentando..." : "Reintentar generación"}
      </Button>
    </div>
  );
}
