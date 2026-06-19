"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string().min(8, "Mínimo 8 caracteres"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    }).catch(() => null);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      toast.error(data?.error ?? "No se pudo cambiar la contraseña.");
      return;
    }

    toast.success("Contraseña actualizada. Ya podés ingresar.");
    router.push("/login");
  };

  if (!token) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-[-0.5px] text-text-primary">
            Link inválido
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">
            El link no es válido o está incompleto. Pedí uno nuevo desde
            recuperar contraseña.
          </p>
        </div>
        <p className="text-center text-sm text-text-secondary">
          <Link
            href="/forgot-password"
            className="font-medium text-brand-pink transition-opacity hover:opacity-80"
          >
            Pedir un link nuevo
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <h1 className="text-[28px] font-medium tracking-[-0.5px] text-text-primary">
          Nueva contraseña
        </h1>
        <p className="text-sm text-text-secondary">
          Elegí una contraseña de al menos 8 caracteres.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Nueva contraseña" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="********"
              {...register("password")}
            />
          </Field>

          <Field label="Repetir contraseña" error={errors.confirm?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="********"
              {...register("confirm")}
            />
          </Field>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-text-secondary">
        <Link
          href="/login"
          className="font-medium text-brand-pink transition-opacity hover:opacity-80"
        >
          Volver a ingresar
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
