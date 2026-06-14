"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { PlatformToggle } from "@/components/ui/PlatformToggle";

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
    <div className="mx-auto max-w-lg space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <h1 className="text-[28px] font-medium tracking-[-0.5px]">Ajustes</h1>
        <p className="text-sm text-text-secondary">
          Cambios de perfil aplican al próximo viernes.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Nicho" error={errors.niche?.message}>
            <Select {...register("niche")}>
              <option value="">Seleccioná un nicho</option>
              {NICHES.map((niche) => (
                <option key={niche} value={niche}>
                  {niche === "otro" ? "Otro" : niche}
                </option>
              ))}
            </Select>
          </Field>

          {selectedNiche === "otro" && (
            <Field label="Tu nicho" error={errors.customNiche?.message}>
              <Input type="text" {...register("customNiche")} />
            </Field>
          )}

          <Field label="Audiencia" error={errors.audience?.message}>
            <Input type="text" {...register("audience")} />
          </Field>

          <Field label="Ubicación" error={errors.location?.message}>
            <Input type="text" {...register("location")} />
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-medium text-text-primary">Plataformas</p>
            <PlatformToggle
              options={PLATFORMS}
              selected={selectedPlatforms}
              onToggle={togglePlatform}
            />
            {errors.platforms && (
              <p className="text-xs text-red-600">
                {errors.platforms.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tono">
              <Select {...register("tone")}>
                {TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Idioma">
              <Select {...register("language")}>
                {LANGUAGES.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Frecuencia (posts por semana)"
            error={errors.frequency?.message}
          >
            <Input
              type="number"
              min={1}
              max={7}
              {...register("frequency", { valueAsNumber: true })}
            />
          </Field>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-medium tracking-[-0.5px]">Suscripción</h2>

        {subscription ? (
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              <span className="font-medium text-text-primary">Estado:</span>{" "}
              {STATUS_LABELS[subscription.status] ?? subscription.status}
            </p>
            <p>
              <span className="font-medium text-text-primary">Plan:</span>{" "}
              {subscription.currency} ${subscription.amount.toLocaleString()}
              /mes
            </p>
            {subscription.nextBillingDate && (
              <p>
                <span className="font-medium text-text-primary">
                  Próximo cobro:
                </span>{" "}
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
          <p className="text-sm text-text-secondary">Sin suscripción activa.</p>
        )}

        {canCancel && (
          <Button
            type="button"
            variant="danger"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelando..." : "Cancelar suscripción"}
          </Button>
        )}
      </Card>
    </div>
  );
}
