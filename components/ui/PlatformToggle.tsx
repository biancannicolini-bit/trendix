import { cn } from "@/lib/utils";

type PlatformToggleProps = {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

export function PlatformToggle({
  options,
  selected,
  onToggle,
}: PlatformToggleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-sm font-medium transition-all duration-200",
              active
                ? "border-brand-pink bg-brand-pink text-brand-light"
                : "border-[var(--color-border-tertiary)] text-text-secondary hover:border-brand-pink/40"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
