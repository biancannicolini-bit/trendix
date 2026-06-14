import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "pillar" | "accent" | "dark";
  className?: string;
};

export function Badge({
  children,
  variant = "pillar",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full text-[11px] font-medium",
        variant === "pillar" &&
          "bg-brand-light text-brand-muted border border-[#F9B8D4] px-2.5 py-0.5",
        variant === "accent" &&
          "bg-brand-surface text-brand-muted border border-brand-border px-3.5 py-1 text-xs",
        variant === "dark" &&
          "bg-brand-surface text-brand-muted border border-brand-border px-3.5 py-1 text-xs",
        className
      )}
    >
      {children}
    </span>
  );
}
