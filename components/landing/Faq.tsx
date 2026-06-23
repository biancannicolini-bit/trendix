"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "¿De dónde salen los temas?",
    a: "Analizamos temas tendencia de tu nicho y zona cada semana. No son ideas genéricas: son temas que tu audiencia está buscando ahora.",
  },
  {
    q: "¿Qué incluye cada guion?",
    a: "Hook de apertura, desarrollo completo, CTA, caption listo para pegar y hashtags. Todo pensado para que solo tengas que grabar.",
  },
  {
    q: "¿Para qué plataformas sirve?",
    a: "Instagram, TikTok, YouTube y LinkedIn. Elegís tus plataformas en el perfil y adaptamos el contenido.",
  },
  {
    q: "¿Puedo regenerar un post si no me convence?",
    a: "Sí. Desde cada post podés regenerar el guion las veces que quieras, con un ángulo nuevo.",
  },
  {
    q: "¿Cómo pago?",
    a: "Con tarjeta de crédito (se renueva solo) o con débito, efectivo y dinero en cuenta vía Mercado Pago. Si elegís débito, te avisamos antes de que venza para renovar.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Cuando quieras, sin vueltas. Cancelás desde tus ajustes y listo.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl divide-y divide-[var(--color-border-tertiary)] overflow-hidden rounded-xl border border-[var(--color-border-tertiary)] bg-bg-primary">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[15px] font-medium text-text-primary">
                {item.q}
              </span>
              <span
                className={`shrink-0 text-brand-pink transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                aria-hidden="true"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 3.5v11M3.5 9h11"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            <div
              className="grid transition-all duration-200 ease-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-text-secondary">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
