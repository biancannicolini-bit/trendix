import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { HookBar } from "@/components/ui/HookBar";
import { Faq } from "@/components/landing/Faq";
import { COPY } from "@/lib/copy";
import { BRAND } from "@/lib/brand";

const APP = "https://app.scripvox.com";

export const metadata: Metadata = {
  title: { absolute: "Scripvox — Del trend al guion, en segundos" },
  description:
    "Analizamos temas tendencia de tu nicho y generamos guiones completos para tus reels, listos para grabar. 5 posts por semana.",
};

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-pink">
      {children}
    </p>
  );
}

export default function LandingPage() {
  return (
    <main className="bg-bg-secondary">
      {/* ===== Nav ===== */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur"
        style={{
          background: "rgba(23, 9, 14, 0.85)",
          borderColor: BRAND.BORDER,
        }}
      >
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-3.5 lg:px-8">
          <Logo size={28} variant="dark" />
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`${APP}/login`}
              className="hidden px-3 py-2 text-sm font-medium text-brand-muted transition-colors hover:text-brand-light sm:inline"
            >
              Ingresar
            </a>
            <a
              href={`${APP}/register`}
              className="rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: BRAND.PINK, color: BRAND.LIGHT }}
            >
              Empezar ahora
            </a>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="auth-aside relative overflow-hidden" style={{ background: BRAND.DARK }}>
        <div className="relative mx-auto max-w-[1100px] px-5 pb-20 pt-20 text-center lg:px-8 lg:pb-28 lg:pt-28">
          <div
            className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs animate-fade-in-up"
            style={{ background: BRAND.SURFACE, borderColor: BRAND.BORDER, color: BRAND.MUTED }}
          >
            Trends reales · Guiones completos
          </div>

          <h1
            className="mx-auto max-w-3xl font-medium leading-[1.05] tracking-[-2px] animate-fade-in-up"
            style={{ color: BRAND.LIGHT, fontSize: "clamp(38px, 7vw, 72px)" }}
          >
            Del trend al guion, en segundos.
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed animate-fade-in-up animate-delay-1 lg:text-lg"
            style={{ color: BRAND.MUTED }}
          >
            {COPY.productDescription} Cada semana, listo para grabar.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 animate-fade-in-up animate-delay-2 sm:flex-row">
            <a
              href={`${APP}/register`}
              className="w-full rounded-md px-7 py-3.5 text-[15px] font-medium transition-opacity hover:opacity-90 sm:w-auto"
              style={{ background: BRAND.PINK, color: BRAND.LIGHT }}
            >
              {COPY.ctaPrimary}
            </a>
            <a
              href="#como-funciona"
              className="w-full rounded-md border px-6 py-3.5 text-[15px] font-medium transition-colors sm:w-auto"
              style={{ borderColor: BRAND.BORDER, color: BRAND.MUTED }}
            >
              Ver cómo funciona
            </a>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-4 animate-fade-in-up animate-delay-3">
            {[
              { n: "5", l: "posts por semana" },
              { n: "4", l: "plataformas" },
              { n: "100%", l: "listo para grabar" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-[28px] font-medium tracking-[-1px]" style={{ color: BRAND.LIGHT }}>
                  {s.n}
                </p>
                <p className="mt-1 text-[13px]" style={{ color: BRAND.MUTED }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Cómo funciona ===== */}
      <section id="como-funciona" className="bg-bg-primary px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-14 text-center">
            <SectionLabel>Cómo funciona</SectionLabel>
            <h2 className="mt-2 text-[28px] font-medium tracking-[-1px] text-text-primary lg:text-[36px]">
              De tu nicho al guion, en tres pasos
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                n: "1",
                t: "Configurás tu nicho",
                d: "Nos decís tu rubro, tu zona, tu audiencia y las plataformas donde publicás.",
              },
              {
                n: "2",
                t: "Encontramos los trends",
                d: "Analizamos temas tendencia reales de tu nicho y tu zona, semana a semana.",
              },
              {
                n: "3",
                t: "Recibís tus guiones",
                d: "5 posts con hook, desarrollo, CTA, caption y hashtags. Solo te queda grabar.",
              },
            ].map((step) => (
              <div key={step.n} className="text-center sm:text-left">
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-medium sm:mx-0"
                  style={{ border: `1.5px solid ${BRAND.PINK}`, color: BRAND.PINK }}
                >
                  {step.n}
                </div>
                <h3 className="mt-5 text-lg font-medium tracking-[-0.5px] text-text-primary">
                  {step.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Preview post ===== */}
      <section className="px-5 py-20 lg:px-8 lg:py-28" style={{ background: BRAND.LIGHT }}>
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <SectionLabel>Un ejemplo real</SectionLabel>
            <h2 className="mt-2 text-[28px] font-medium tracking-[-1px] text-text-primary lg:text-[36px]">
              Así llega cada post
            </h2>
          </div>

          <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-[0_20px_60px_-24px_rgba(23,9,14,0.25)] lg:p-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{ background: BRAND.LIGHT, color: BRAND.MUTED, border: "0.5px solid #F9B8D4" }}
              >
                Trending
              </span>
              <span className="text-[11px] text-text-tertiary">Instagram · Reel · 60 seg</span>
            </div>

            <h3 className="mt-4 text-[22px] font-medium leading-tight tracking-[-0.5px] text-text-primary">
              Por qué todos están hablando de las tasas esta semana
            </h3>

            <div className="mt-4">
              <HookBar>
                Si seguís esperando que bajen para comprar, mirá este dato antes de decidir.
              </HookBar>
            </div>

            <div className="mt-5 border-l-2 pl-4" style={{ borderColor: "rgba(61,24,40,0.15)" }}>
              <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: BRAND.PINK }}>
                Desarrollo · 3-52 seg
              </p>
              <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-text-primary">
                <li>Esta semana la búsqueda de créditos subió 40% en tu zona.</li>
                <li>Eso mueve la demanda antes que el precio.</li>
                <li>El que esperó pierde la mejor ventana.</li>
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {["#finanzas", "#creditos", "#inversion", "#argentina"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-xs"
                  style={{ background: "rgba(61,24,40,0.05)", color: BRAND.MUTED }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section className="bg-bg-primary px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <SectionLabel>Precio</SectionLabel>
            <h2 className="mt-2 text-[28px] font-medium tracking-[-1px] text-text-primary lg:text-[36px]">
              Un plan, todo incluido
            </h2>
          </div>

          <div
            className="mx-auto max-w-md overflow-hidden rounded-2xl"
            style={{ border: `2px solid ${BRAND.PINK}` }}
          >
            <div className="px-7 py-8 text-center" style={{ background: BRAND.DARK }}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-pink">
                Plan mensual
              </p>
              <p className="mt-3 text-[44px] font-medium leading-none tracking-[-1.5px]" style={{ color: BRAND.LIGHT }}>
                $15.000
              </p>
              <p className="mt-2 text-sm" style={{ color: BRAND.MUTED }}>
                ARS por mes · Cancelás cuando quieras
              </p>
            </div>

            <div className="space-y-4 px-7 py-8">
              <ul className="space-y-3">
                {[
                  ...COPY.planFeatures,
                  "Regenerá posts cuando quieras",
                  "Pagás con crédito o débito",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-text-primary">
                    <CheckIcon />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`${APP}/register`}
                className="block rounded-md py-3.5 text-center text-[15px] font-medium transition-opacity hover:opacity-90"
                style={{ background: BRAND.PINK, color: BRAND.LIGHT }}
              >
                {COPY.ctaPrimary}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-bg-secondary px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <SectionLabel>Preguntas</SectionLabel>
            <h2 className="mt-2 text-[28px] font-medium tracking-[-1px] text-text-primary lg:text-[36px]">
              Lo que querés saber
            </h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="px-5 py-24 lg:px-8 lg:py-32" style={{ background: BRAND.DARK }}>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="font-medium leading-[1.1] tracking-[-1.5px]"
            style={{ color: BRAND.LIGHT, fontSize: "clamp(30px, 5vw, 48px)" }}
          >
            Tu próxima semana de contenido, lista.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed" style={{ color: BRAND.MUTED }}>
            Encontramos el trend. Escribimos el guion. Vos lo grabás.
          </p>
          <a
            href={`${APP}/register`}
            className="mt-9 inline-block rounded-md px-8 py-4 text-[15px] font-medium transition-opacity hover:opacity-90"
            style={{ background: BRAND.PINK, color: BRAND.LIGHT }}
          >
            {COPY.ctaPrimary}
          </a>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="px-5 py-12 lg:px-8" style={{ background: BRAND.FOOTER }}>
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo size={24} variant="dark" />
          <div className="flex items-center gap-6 text-sm" style={{ color: BRAND.MUTED }}>
            <a href={`${APP}/login`} className="transition-colors hover:text-brand-light">
              Ingresar
            </a>
            <a href={`${APP}/register`} className="transition-colors hover:text-brand-light">
              Crear cuenta
            </a>
            <a href="#como-funciona" className="transition-colors hover:text-brand-light">
              Cómo funciona
            </a>
          </div>
          <p className="text-[13px]" style={{ color: BRAND.MUTED }}>
            © 2026 Scripvox
          </p>
        </div>
      </footer>
    </main>
  );
}
