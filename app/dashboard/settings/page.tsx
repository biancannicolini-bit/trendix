"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const schema = z
  .object({
    niche: z.string().min(1, "Seleccioná un nicho"),
    customNiche: z.string().optional(),
    audience: z.string().min(3, "Describí tu audiencia"),
    location: z.string().min(2, "Ingresá tu ubicación"),
    platforms: z.array(z.string()).min(1, "Elegí al menos una plataforma"),
    tone: z.string().min(1, "Elegí un tono"),
    language: z.string().min(1, "Elegí un idioma"),
    frequency: z.number().int().min(1).max(7),
  })
  .refine(
    (data) =>
      data.niche === "otro" ? Boolean(data.customNiche?.trim()) : true,
    { message: "Ingresá tu nicho", path: ["customNiche"] }
  );

type FormValues = z.infer<typeof schema>;

type Subscription = {
  status: string;
  amount: number;
  currency: string;
  nextBillingDate: string | null;
  cancelAt: string | null;
};

const NICHES = [
  "inmobiliario",
  "fitness",
  "finanzas",
  "gastronomia",
  "moda",
  "tecnologia",
  "viajes",
  "salud",
  "otro",
];

const PLATFORMS = ["Instagram", "TikTok"];
const TONES = ["Educativo", "Inspirador", "Directo", "Entretenido"];
const LANGUAGES = ["Español", "Portugués", "Inglés"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente de pago",
  authorized: "Activa",
  cancelling: "Cancelación programada",
  cancelled: "Cancelada",
  paused: "Pausada",
  payment_failed: "Pago fallido",
};

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedNiche = watch("niche");
  const selectedPlatforms = watch("platforms") ?? [];

  useEffect(() => {
    const load = async () => {
      const [profileRes, subRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/subscription"),
      ]);

      if (profileRes.ok) {
        const { profile } = await profileRes.json();
        if (profile) {
          reset({
            niche: profile.niche,
            customNiche: profile.customNiche ?? "",
            audience: profile.audience,
            location: profile.location,
            platforms: profile.platforms,
            tone: profile.tone,
            language: profile.language,
            frequency: profile.frequency,
          });
        }
      }

      if (subRes.ok) {
        const { subscription: sub } = await subRes.json();
        setSubscription(sub);
      }
    };

    load();
  }, [reset]);

  const togglePlatform = (platform: string) => {
    const next = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((p) => p !== platform)
      : [...selectedPlatforms, platform];
    setValue("platforms", next, { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "No pudimos guardar los cambios");
      return;
    }

    toast.success("Perfil actualizado. Aplica al próximo viernes.");
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "¿Cancelar suscripción? Mantenés acceso hasta el fin del período pagado."
      )
    ) {
      return;
    }

    setCancelling(true);
    const res = await fetch("/api/subscription/cancel", { method: "POST" });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "No pudimos cancelar la suscripción");
      setCancelling(false);
      return;
    }

    const data = await res.json();
    toast.success("Suscripción cancelada. Acceso hasta fin del período.");
    setSubscription((prev) =>
      prev
        ? {
            ...prev,
            status: "cancelling",
            cancelAt: data.cancelAt,
          }
        : prev
    );
    setCancelling(false);
  };

  const canCancel =
    subscription &&
    ["authorized", "payment_failed"].includes(subscription.status);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <Link href="/dashboard" className="text-sm font-medium text-gray-600">
        ← Volver al calendario
      </Link>

      <div className="mt-6 space-y-8">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold">Ajustes</h1>
            <p className="text-sm text-gray-600">
              Cambios de perfil aplican al próximo viernes.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nicho</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                {...register("niche")}
              >
                <option value="">Seleccioná un nicho</option>
                {NICHES.map((niche) => (
                  <option key={niche} value={niche}>
                    {niche === "otro" ? "Otro" : niche}
                  </option>
                ))}
              </select>
              {errors.niche && (
                <p className="text-xs text-red-600">{errors.niche.message}</p>
              )}
            </div>

            {selectedNiche === "otro" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Tu nicho</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  {...register("customNiche")}
                />
                {errors.customNiche && (
                  <p className="text-xs text-red-600">
                    {errors.customNiche.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Audiencia</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                {...register("audience")}
              />
              {errors.audience && (
                <p className="text-xs text-red-600">
                  {errors.audience.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Ubicación</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-xs text-red-600">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Plataformas</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    type="button"
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      selectedPlatforms.includes(platform)
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
              {errors.platforms && (
                <p className="text-xs text-red-600">
                  {errors.platforms.message as string}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Tono</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  {...register("tone")}
                >
                  {TONES.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Idioma</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  {...register("language")}
                >
                  {LANGUAGES.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Frecuencia (posts por semana)
              </label>
              <input
                type="number"
                min={1}
                max={7}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                {...register("frequency", { valueAsNumber: true })}
              />
              {errors.frequency && (
                <p className="text-xs text-red-600">
                  {errors.frequency.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </section>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Suscripción</h2>

          {subscription ? (
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Estado:</span>{" "}
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </p>
              <p>
                <span className="font-medium">Plan:</span>{" "}
                {subscription.currency} ${subscription.amount.toLocaleString()}
                /mes
              </p>
              {subscription.nextBillingDate && (
                <p>
                  <span className="font-medium">Próximo cobro:</span>{" "}
                  {new Date(subscription.nextBillingDate).toLocaleDateString(
                    "es-AR"
                  )}
                </p>
              )}
              {subscription.cancelAt && subscription.status === "cancelling" && (
                <p className="text-amber-700">
                  Acceso hasta{" "}
                  {new Date(subscription.cancelAt).toLocaleDateString("es-AR")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Sin suscripción activa.</p>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
            >
              {cancelling ? "Cancelando..." : "Cancelar suscripción"}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
