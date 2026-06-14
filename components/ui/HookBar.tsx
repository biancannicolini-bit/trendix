import { BRAND } from "@/lib/brand";

type HookBarProps = {
  label?: string;
  children: React.ReactNode;
};

export function HookBar({ label = "Hook — 0-3 seg", children }: HookBarProps) {
  return (
    <div
      className="rounded-r-md py-2.5 pl-3.5 pr-4"
      style={{
        background: BRAND.LIGHT,
        borderLeft: `2px solid ${BRAND.PINK}`,
      }}
    >
      <p
        className="mb-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ color: BRAND.MUTED }}
      >
        {label}
      </p>
      <p className="text-[13px] italic leading-relaxed text-text-primary">
        {children}
      </p>
    </div>
  );
}
