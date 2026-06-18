export type MonthlyStats = {
  month: string;
  total: number;
  completed: number;
  percentage: number;
};

function buildMessage({ total, completed, percentage }: MonthlyStats) {
  const remaining = Math.max(0, total - completed);
  if (total === 0) return "Todavía no hay contenido este mes.";
  if (percentage === 100) return "Mes completo. Cumpliste con todo tu contenido.";
  if (percentage >= 80) return `Casi todo hecho. Te faltan ${remaining}.`;
  if (percentage >= 40) return "Buen ritmo. Ya hiciste más de la mitad.";
  if (percentage > 0) return `Vas en camino. Te faltan ${remaining} para el 100%.`;
  return "Arrancá tildando lo que ya hiciste.";
}

export function MonthlyProgress({ stats }: { stats: MonthlyStats }) {
  const { month, total, completed, percentage } = stats;

  const size = 76;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percentage / 100);

  return (
    <div className="animate-fade-in-up flex items-center gap-5 rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary p-5 shadow-[0_1px_2px_rgba(23,9,14,0.04),0_12px_32px_-16px_rgba(23,9,14,0.12)]">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-border-tertiary)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#F0287E"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[15px] font-medium">
          {percentage}%
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-pink">
          Tu mes · {month}
        </p>
        <p className="text-[15px] font-medium text-text-primary">
          {completed} de {total} {total === 1 ? "post hecho" : "posts hechos"}
        </p>
        <p className="text-sm text-text-secondary">{buildMessage(stats)}</p>
      </div>
    </div>
  );
}
