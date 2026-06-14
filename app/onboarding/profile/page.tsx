"use client";

import { useRouter } from "next/navigation";
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
    (data) => (data.niche === "otro" ? Boolean(data.customNiche?.trim()) : true),
    { message: "Ingresá tu nicho", path: ["customNiche"] }
  );

type FormValues = z.infer<typeof schema>;

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

export default function OnboardingProfilePage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      niche: "",
      customNiche: "",
      platforms: ["Instagram"],
      tone: "Educativo",
      language: "Español",
      frequency: 5,
    },
  });

  const selectedNiche = watch("niche");
  const selectedPlatforms = watch("platforms");

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
      body: JSON.stringify({
        niche: values.niche,
        customNiche: values.customNiche,
        audience: values.audience,
        location: values.location,
        platforms: values.platforms,
        tone: values.tone,
        language: values.language,
        frequency: values.frequency,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "No pudimos guardar tu perfil");
      return;
    }

    const data = await res.json();
    router.push(data.nextUrl ?? "/onboarding/payment");
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <h1 className="text-[28px] font-medium tracking-[-0.5px]">
          Configurar perfil
        </h1>
        <p className="text-sm text-text-secondary">
          Usamos estos datos para generar contenido con trends reales.
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
              <Input
                type="text"
                placeholder="Ej: belleza"
                {...register("customNiche")}
              />
            </Field>
          )}

          <Field label="Audiencia" error={errors.audience?.message}>
            <Input
              type="text"
              placeholder="Ej: mujeres 25-35 que entrenan en casa"
              {...register("audience")}
            />
          </Field>

          <Field label="Ubicación" error={errors.location?.message}>
            <Input
              type="text"
              placeholder="Ej: Buenos Aires"
              {...register("location")}
            />
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

          <Field label="Frecuencia (posts por semana)" error={errors.frequency?.message}>
            <Input
              type="number"
              min={1}
              max={7}
              {...register("frequency", { valueAsNumber: true })}
            />
          </Field>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Continuar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
