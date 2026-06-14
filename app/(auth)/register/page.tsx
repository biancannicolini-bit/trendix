"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { COPY } from "@/lib/copy";

const schema = z.object({
  name: z.string().min(2, "Ingresá tu nombre"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Ingresá un teléfono válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "No se pudo crear la cuenta");
      return;
    }

    const signInRes = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signInRes?.error) {
      toast.error("Cuenta creada, pero no pudimos iniciar sesión");
      return;
    }

    router.push("/onboarding/profile");
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <h1 className="text-[28px] font-medium tracking-[-0.5px] text-text-primary">
          Crear cuenta
        </h1>
        <p className="text-sm text-text-secondary">{COPY.tagline}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Nombre" error={errors.name?.message}>
            <Input
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              {...register("name")}
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              {...register("email")}
            />
          </Field>

          <Field label="Teléfono" error={errors.phone?.message}>
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="+54 9 11 1234 5678"
              {...register("phone")}
            />
          </Field>

          <Field label="Contraseña" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="********"
              {...register("password")}
            />
          </Field>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Continuar"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-text-secondary">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-pink transition-opacity hover:opacity-80"
        >
          Ingresar
        </Link>
      </p>
    </div>
  );
}
