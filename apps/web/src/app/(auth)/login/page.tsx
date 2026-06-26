"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";
import { LogoMark } from "@/components/brand/Logo";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setServerError(null);
    try {
      const res = await api.post<{ success: boolean; data: { token: string } }>(
        "/api/auth/login",
        data,
      );
      setToken(res.data.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Credenciales incorrectas";
      setServerError(message);
    }
  }

  return (
    <Card className="w-full max-w-sm border-border bg-card shadow-2xl shadow-black/40">
      <CardHeader className="space-y-3 text-center">
        <div className="flex justify-center lg:hidden">
          <LogoMark className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <CardTitle className="font-display text-2xl font-bold tracking-tight">
            Bienvenido de nuevo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ingresa a tu taller en GarageFlow
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@taller.rd"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            ¿No tienes taller registrado?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Créalo gratis
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
