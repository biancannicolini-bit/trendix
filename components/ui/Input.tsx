import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-[var(--color-border-tertiary)] bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none transition-colors duration-200 placeholder:text-text-tertiary focus:border-brand-pink",
        className
      )}
      {...props}
    />
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-[var(--color-border-tertiary)] bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-brand-pink",
        className
      )}
      {...props}
    />
  );
}

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
