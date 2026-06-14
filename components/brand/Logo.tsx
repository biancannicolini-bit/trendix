import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { ScripvoxIcon } from "./ScripvoxIcon";

type LogoProps = {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
};

export function Logo({ size = 28, variant = "dark", className }: LogoProps) {
  const textColor =
    variant === "dark" ? BRAND.LIGHT : "var(--color-text-primary)";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ScripvoxIcon size={size} />
      <span
        className="font-medium leading-none"
        style={{
          fontSize: size * 0.72,
          letterSpacing: -0.5,
        }}
      >
        <span style={{ color: textColor }}>scrip</span>
        <span style={{ color: BRAND.PINK, fontStyle: "italic" }}>vox</span>
      </span>
    </div>
  );
}
