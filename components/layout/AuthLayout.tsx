import { Logo } from "@/components/brand/Logo";
import { COPY } from "@/lib/copy";
import { BRAND } from "@/lib/brand";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <aside
        className="relative flex flex-col justify-between px-6 py-10 lg:w-[44%] lg:px-12 lg:py-14"
        style={{ background: BRAND.DARK }}
      >
        <Logo size={32} variant="dark" />

        <div className="mt-12 space-y-6 lg:mt-0">
          <div className="space-y-4 animate-fade-in-up">
            <h1
              className="max-w-sm text-[32px] font-medium leading-[1.1] tracking-[-1.5px] lg:text-[40px]"
              style={{ color: BRAND.LIGHT }}
            >
              {COPY.tagline}
            </h1>
            <p
              className="max-w-sm text-base leading-relaxed"
              style={{ color: BRAND.MUTED }}
            >
              {COPY.productDescription}
            </p>
          </div>

          <div
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs animate-fade-in-up animate-delay-1"
            style={{
              background: BRAND.SURFACE,
              borderColor: BRAND.BORDER,
              color: BRAND.MUTED,
            }}
          >
            Trends reales · Guiones completos
          </div>
        </div>

        <p
          className="mt-10 hidden text-[13px] lg:block"
          style={{ color: BRAND.MUTED }}
        >
          5 posts por semana · Cancelás cuando quieras
        </p>
      </aside>

      <div className="flex flex-1 flex-col bg-bg-secondary px-4 py-10 lg:px-12 lg:py-14">
        <div className="mx-auto w-full max-w-[480px] flex-1">{children}</div>
      </div>
    </div>
  );
}
