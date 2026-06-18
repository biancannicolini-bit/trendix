"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/Spinner";
import { WeekCalendar, type CalendarPost } from "@/components/dashboard/WeekCalendar";
import {
  MonthlyProgress,
  type MonthlyStats,
} from "@/components/dashboard/MonthlyProgress";
import { humanizeGenerationError } from "@/lib/service-errors";

type CalendarStatus = "generating" | "ready" | "error";

type CalendarResponse = {
  calendar: {
    id: string;
    status: CalendarStatus;
    weekStart: string;
    errorMessage?: string | null;
    posts: CalendarPost[];
  } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [calendar, setCalendar] = useState<CalendarResponse["calendar"]>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const kickoffAttempted = useRef(false);

  const refreshStats = useCallback(async () => {
    const res = await fetch("/api/stats/monthly").catch(() => null);
    if (res?.ok) setStats(await res.json());
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      await refreshStats();
    };
    void loadStats();
  }, [refreshStats]);

  const onToggle = useCallback(
    (_id: string, completed: boolean) => {
      setStats((s) => {
        if (!s) return s;
        const done = Math.min(s.total, Math.max(0, s.completed + (completed ? 1 : -1)));
        const percentage = s.total === 0 ? 0 : Math.round((done / s.total) * 100);
        return { ...s, completed: done, percentage };
      });
      void refreshStats();
    },
    [refreshStats]
  );

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
      {stats && <MonthlyProgress stats={stats} />}
      <WeekCalendar calendar={calendar} onToggle={onToggle} />
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
  const detail = humanizeGenerationError(
    calendar.errorMessage ??
      diagnose?.lastError?.errorMessage ??
      "No pudimos generar tu contenido."
  );

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
