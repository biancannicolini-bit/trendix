"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { cn } from "@/lib/utils";

export type CalendarPost = {
  id: string;
  day: string;
  platform: string;
  pillar: string;
  title: string;
  hook: string;
  completed?: boolean;
};

export type ReadyCalendar = {
  id: string;
  weekStart: string;
  posts: CalendarPost[];
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

const DAY_ABBR: Record<string, string> = {
  Lunes: "Lun",
  Martes: "Mar",
  Miércoles: "Mié",
  Jueves: "Jue",
  Viernes: "Vie",
  Sábado: "Sáb",
  Domingo: "Dom",
};

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Fecha del día con offset desde weekStart, sin drift de zona horaria. */
function offsetDate(weekStart: string, offset: number) {
  const [y, m, d] = weekStart.slice(0, 10).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offset));
  return { day: dt.getUTCDate(), month: MONTHS[dt.getUTCMonth()] };
}

type WeekCalendarProps = {
  calendar: ReadyCalendar;
  /** Persistir el tilde contra la API. false en previews. */
  persist?: boolean;
  /** Avisa al padre cuando cambia un tilde (para refrescar el progreso mensual). */
  onToggle?: (id: string, completed: boolean) => void;
};

export function WeekCalendar({
  calendar,
  persist = true,
  onToggle,
}: WeekCalendarProps) {
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(calendar.posts.map((p) => [p.id, Boolean(p.completed)]))
  );

  const toggle = (id: string) => {
    const next = !done[id];
    setDone((d) => ({ ...d, [id]: next }));
    onToggle?.(id, next);
    if (persist) {
      void fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      }).catch(() => {});
    }
  };

  const postsByDay = calendar.posts.reduce<Record<string, CalendarPost[]>>(
    (acc, post) => {
      (acc[post.day] = acc[post.day] ?? []).push(post);
      return acc;
    },
    {}
  );

  const activeDays = DAY_ORDER.map((name, index) => ({ name, index })).filter(
    (d) => postsByDay[d.name]?.length
  );

  const total = calendar.posts.length;
  const completedCount = calendar.posts.filter((p) => done[p.id]).length;
  const weekPct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const start = offsetDate(calendar.weekStart, 0);
  const end = offsetDate(calendar.weekStart, 6);
  const range =
    start.month === end.month
      ? `${start.day} al ${end.day} de ${end.month}`
      : `${start.day} ${start.month} al ${end.day} ${end.month}`;

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-[28px] font-medium tracking-[-0.5px]">
              Tu calendario semanal
            </h1>
            <p className="text-sm text-text-secondary">
              Contenido basado en temas tendencia, listo para grabar.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-border-tertiary)] bg-bg-primary px-3.5 py-1.5 text-[13px]">
            <span className="font-medium">{range}</span>
            <span className="text-text-tertiary">·</span>
            <span className="text-text-secondary">
              {total} {total === 1 ? "post" : "posts"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border-tertiary)]">
            <div
              className="h-full rounded-full bg-brand-pink transition-[width] duration-500"
              style={{ width: `${weekPct}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-xs text-text-secondary">
            {completedCount}/{total} hechos
          </span>
        </div>
      </div>

      <div>
        {activeDays.map((d, i) => {
          const date = offsetDate(calendar.weekStart, d.index);
          const isLast = i === activeDays.length - 1;
          return (
            <div
              key={d.name}
              className="animate-fade-in-up grid grid-cols-[3.5rem_1fr] gap-4 sm:gap-5"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex flex-col items-center">
                <div className="flex w-full flex-col items-center rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary py-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
                    {DAY_ABBR[d.name]}
                  </span>
                  <span className="text-lg font-medium leading-tight">
                    {date.day}
                  </span>
                </div>
                {!isLast && (
                  <div className="my-1 w-px flex-1 bg-[var(--color-border-tertiary)]" />
                )}
              </div>

              <div className={cn("space-y-3", !isLast && "pb-6")}>
                {postsByDay[d.name].map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    done={Boolean(done[post.id])}
                    onToggle={toggle}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostCard({
  post,
  done,
  onToggle,
}: {
  post: CalendarPost;
  done: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary p-4 shadow-[0_1px_2px_rgba(23,9,14,0.04)] transition-all duration-200",
        done
          ? "opacity-65"
          : "hover:border-brand-pink/50 hover:shadow-[0_6px_24px_-8px_rgba(240,40,126,0.18)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <PlatformIcon
            platform={post.platform}
            className={cn(
              "transition-colors",
              done
                ? "text-text-tertiary"
                : "text-text-tertiary group-hover:text-brand-pink"
            )}
          />
          <Badge>{post.pillar}</Badge>
        </div>
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? "Marcar como pendiente" : "Marcar como hecho"}
          onClick={() => onToggle(post.id)}
          className={cn(
            "relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors duration-200",
            done
              ? "border-brand-pink bg-brand-pink text-brand-light"
              : "border-[var(--color-border-secondary)] text-transparent hover:border-brand-pink"
          )}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8l3.5 3.5L13 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <Link
        href={`/dashboard/post/${post.id}`}
        className="after:absolute after:inset-0 after:content-['']"
      >
        <p
          className={cn(
            "mt-3 text-sm font-medium leading-snug",
            done ? "text-text-tertiary line-through" : "text-text-primary"
          )}
        >
          {post.title}
        </p>
      </Link>
      <p
        className={cn(
          "mt-1.5 line-clamp-2 text-xs leading-relaxed",
          done ? "text-text-tertiary" : "text-text-secondary"
        )}
      >
        {post.hook}
      </p>
    </div>
  );
}
