"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Email inválido"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => {});
    // Siempre mostramos confirmación, exista o no la cuenta.
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-[-0.5px] text-text-primary">
            Revisá tu email
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">
            Si hay una cuenta con {getValues("email")}, te enviamos un link para
            cambiar tu contraseña. Vence en una hora.
          </p>
        </div>
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

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <h1 className="text-[28px] font-medium tracking-[-0.5px] text-text-primary">
          Recuperar contraseña
        </h1>
        <p className="text-sm text-text-secondary">
          Ingresá tu email y te mandamos un link para crear una nueva.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              {...register("email")}
            />
          </Field>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-text-secondary">
        ¿Te acordaste?{" "}
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
