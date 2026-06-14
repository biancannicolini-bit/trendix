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
          "bg-bg-primary border border-[var(--color-border-tertiary)]",
        variant === "featured" &&
          "bg-bg-primary border-2 border-brand-pink overflow-hidden",
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
