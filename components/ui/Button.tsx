import { cn } from "@/lib/utils";
import Link from "next/link";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "ghost-dark" | "danger";
  size?: "default" | "sm";
  href?: string;
};

const variants = {
  primary:
    "bg-brand-pink text-brand-light hover:opacity-90 transition-opacity duration-200",
  ghost:
    "bg-transparent text-text-secondary border border-[var(--color-border-tertiary)] hover:border-[var(--color-border-secondary)] transition-colors duration-200",
  "ghost-dark":
    "bg-transparent text-brand-muted border border-brand-border hover:text-brand-light transition-colors duration-200",
  danger:
    "bg-transparent text-red-700 border border-red-200 hover:bg-red-50 transition-colors duration-200",
};

const sizes = {
  default: "px-7 py-3.5 text-[15px]",
  sm: "px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "default",
  className,
  href,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex w-full items-center justify-center rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
