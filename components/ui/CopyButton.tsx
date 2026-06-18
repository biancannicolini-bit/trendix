"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export function CopyButton({ text, label = "Copiar", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // El navegador puede bloquear el portapapeles sin gesto del usuario; lo ignoramos.
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors duration-200",
        copied
          ? "border-brand-pink/50 text-brand-pink"
          : "border-[var(--color-border-tertiary)] bg-bg-primary text-text-secondary hover:border-brand-pink/50 hover:text-brand-pink",
        className
      )}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8l3.5 3.5L13 4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M3.5 10.5A1.5 1.5 0 0 1 2.5 9V3A1.5 1.5 0 0 1 4 1.5h5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
