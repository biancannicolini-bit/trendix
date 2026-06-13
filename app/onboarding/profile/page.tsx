"use client";

import { useRouter } from "next/navigation";
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

    router.push("/onboarding/payment");
  };

  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Configurar perfil</h1>
          <p className="text-sm text-gray-600">
            Usamos estos datos para generar contenido con tendencias reales.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
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
                placeholder="Ej: belleza"
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
              placeholder="Ej: mujeres 25-35 que entrenan en casa"
              {...register("audience")}
            />
            {errors.audience && (
              <p className="text-xs text-red-600">{errors.audience.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Ubicación</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Ej: Buenos Aires"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-red-600">{errors.location.message}</p>
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
              <p className="text-xs text-red-600">{errors.frequency.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Guardando..." : "Continuar"}
          </button>
        </form>
      </div>
    </main>
  );
}
