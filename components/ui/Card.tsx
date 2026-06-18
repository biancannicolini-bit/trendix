import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "featured" | "surface";
};

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-5 animate-fade-in-up",
        variant === "default" &&
          "bg-bg-primary border border-[var(--color-border-tertiary)] shadow-[0_1px_2px_rgba(23,9,14,0.04),0_12px_32px_-16px_rgba(23,9,14,0.12)]",
        variant === "featured" &&
          "bg-bg-primary border-2 border-brand-pink overflow-hidden shadow-[0_8px_40px_-12px_rgba(240,40,126,0.25)]",
        variant === "surface" &&
          "bg-brand-surface border border-brand-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
