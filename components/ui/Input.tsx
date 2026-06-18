import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-[var(--color-border-tertiary)] bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-tertiary hover:border-[var(--color-border-secondary)] focus:border-brand-pink focus:shadow-[0_0_0_3px_rgba(240,40,126,0.14)]",
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
        "w-full rounded-md border border-[var(--color-border-tertiary)] bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none transition-[border-color,box-shadow] duration-200 hover:border-[var(--color-border-secondary)] focus:border-brand-pink focus:shadow-[0_0_0_3px_rgba(240,40,126,0.14)]",
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
