"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RegenerateButtonProps = {
  postId: string;
  /** En previews no pega contra la API; simula el flujo. */
  demo?: boolean;
};

export function RegenerateButton({ postId, demo = false }: RegenerateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);

    if (demo) {
      setTimeout(() => {
        setLoading(false);
        toast("En la app real, esto regenera el guion con un ángulo nuevo.");
      }, 1400);
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}/regenerate`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "No se pudo regenerar el guion.");
        return;
      }
      toast.success("Guion regenerado.");
      router.refresh();
    } catch {
      toast.error("No se pudo regenerar el guion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--color-border-tertiary)] bg-bg-primary px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors duration-200 hover:border-brand-pink/50 hover:text-brand-pink disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className={cn(loading && "animate-spin")}
      >
        <path
          d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5V5H11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {loading ? "Regenerando…" : "Regenerar"}
    </button>
  );
}
