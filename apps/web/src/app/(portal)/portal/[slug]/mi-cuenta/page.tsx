"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, CheckCircle2 } from "lucide-react";
import portalApi from "@/lib/portalApi";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Requerida"),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Requerida"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type Form = z.infer<typeof schema>;

export default function MiCuentaPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Form) {
    setServerError(null);
    try {
      await portalApi.put("/api/portal/auth/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      reset();
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Error al cambiar contraseña"
      );
    }
  }

  return (
    <div className="max-w-sm space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Mi Cuenta
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualiza tu contraseña de acceso al portal.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          Cambiar contraseña
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Contraseña actualizada correctamente.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Contraseña actual
            </label>
            <input
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Nueva contraseña
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Confirmar contraseña
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
