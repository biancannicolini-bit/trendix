import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <div className={cn("spinner-brand", className)} aria-hidden="true" />;
}

export function LoadingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="animate-fade-in-up flex flex-col items-start gap-4 py-4">
      <Spinner />
      <div className="space-y-2">
        <h1 className="text-[22px] font-medium tracking-[-0.5px] text-text-primary">
          {title}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
