import { Logo } from "@/components/brand/Logo";
import { COPY } from "@/lib/copy";
import { BRAND } from "@/lib/brand";

const FEATURES = [
  "5 posts por semana con guion completo",
  "Trends reales de Google para tu zona",
  "Hook + desarrollo + CTA + caption + hashtags",
];

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="mt-[3px] shrink-0"
    >
      <path
        d="M3 8l3.5 3.5L13 4.5"
        stroke={BRAND.PINK}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Equalizer() {
  return (
    <div className="equalizer" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <aside
        className="auth-aside flex flex-col justify-between gap-10 px-6 py-8 lg:w-[46%] lg:gap-0 lg:px-12 lg:py-14"
        style={{ background: BRAND.DARK }}
      >
        <div className="auth-noise" />

        <Logo size={30} variant="dark" className="relative animate-fade-in-up" />

        <div className="relative space-y-6 lg:space-y-8">
          <div className="space-y-4 animate-fade-in-up">
            <h1
              className="max-w-md text-[27px] font-medium leading-[1.1] tracking-[-1px] sm:text-[32px] sm:tracking-[-1.5px] lg:text-[44px]"
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

          <ul className="space-y-3 animate-fade-in-up animate-delay-1">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-[15px] leading-snug"
                style={{ color: BRAND.LIGHT }}
              >
                <CheckIcon />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs animate-fade-in-up animate-delay-2"
            style={{
              background: BRAND.SURFACE,
              borderColor: BRAND.BORDER,
              color: BRAND.MUTED,
            }}
          >
            Trends reales · Guiones completos
          </div>
        </div>

        <div className="relative mt-10 hidden lg:block animate-fade-in-up animate-delay-3">
          <Equalizer />
          <p className="mt-5 text-[13px]" style={{ color: BRAND.MUTED }}>
            5 posts por semana · Cancelás cuando quieras
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col bg-bg-secondary px-5 py-10 sm:px-6 lg:px-12 lg:py-14">
        <div className="mx-auto my-auto w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
