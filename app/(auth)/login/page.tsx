"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Credenciales inválidas");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <h1 className="text-[28px] font-medium tracking-[-0.5px] text-text-primary">
          Ingresar
        </h1>
        <p className="text-sm text-text-secondary">
          Accedé a tu calendario semanal.
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

          <Field label="Contraseña" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="********"
              {...register("password")}
            />
          </Field>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-text-secondary">
        ¿No tenés cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-pink transition-opacity hover:opacity-80"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
