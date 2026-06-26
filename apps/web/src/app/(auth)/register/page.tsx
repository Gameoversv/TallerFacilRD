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
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

// ── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  tenantName: z.string().min(2, "Mínimo 2 caracteres"),
  city: z.string().optional(),
});

const step2Schema = z.object({
  adminName: z.string().min(2, "Mínimo 2 caracteres"),
  adminEmail: z.string().email("Correo inválido"),
  adminPassword: z.string().min(8, "Mínimo 8 caracteres"),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

// ── Component ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Step 1 form
  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) });

  // Step 2 form
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) });

  function handleStep1(data: Step1) {
    setStep1Data(data);
    setStep(2);
  }

  async function handleStep2(data: Step2) {
    if (!step1Data) return;
    setServerError(null);
    try {
      const res = await api.post<{ success: boolean; data: { token: string } }>(
        "/api/tenants/register",
        {
          tenantName: step1Data.tenantName,
          city: step1Data.city || undefined,
          adminName: data.adminName,
          adminEmail: data.adminEmail,
          adminPassword: data.adminPassword,
        },
      );
      setToken(res.data.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Ocurrió un error, intenta de nuevo";
      setServerError(msg);
    }
  }

  return (
    <Card className="w-full max-w-sm border-border bg-card shadow-2xl shadow-black/40">
      {/* Step indicators */}
      <div className="flex items-center gap-2 px-6 pt-6">
        <StepDot active={step === 1} done={step > 1} label="1" />
        <div className="h-px flex-1 bg-border" />
        <StepDot active={step === 2} done={false} label="2" />
      </div>

      <CardHeader className="space-y-1 pb-4 pt-4 text-center">
        <div className="flex justify-center lg:hidden">
          <LogoMark className="h-8 w-8" />
        </div>
        <CardTitle className="font-display text-xl font-bold tracking-tight">
          {step === 1 ? "Tu taller" : "Tu cuenta"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {step === 1
            ? "¿Cómo se llama tu taller?"
            : "Con qué vas a ingresar al sistema"}
        </p>
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <form
            onSubmit={form1.handleSubmit(handleStep1)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1">
              <Label htmlFor="tenantName">Nombre del taller *</Label>
              <Input
                id="tenantName"
                placeholder="Taller Mecánico El As"
                autoFocus
                {...form1.register("tenantName")}
              />
              {form1.formState.errors.tenantName && (
                <p className="text-xs text-destructive">
                  {form1.formState.errors.tenantName.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="city">
                Ciudad{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="city"
                placeholder="Santo Domingo, Santiago…"
                {...form1.register("city")}
              />
            </div>

            <Button type="submit" className="w-full">
              Continuar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={form2.handleSubmit(handleStep2)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1">
              <Label htmlFor="adminName">Tu nombre *</Label>
              <Input
                id="adminName"
                placeholder="Juan Pérez"
                autoFocus
                {...form2.register("adminName")}
              />
              {form2.formState.errors.adminName && (
                <p className="text-xs text-destructive">
                  {form2.formState.errors.adminName.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="adminEmail">Correo electrónico *</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="juan@mitaller.rd"
                autoComplete="email"
                {...form2.register("adminEmail")}
              />
              {form2.formState.errors.adminEmail && (
                <p className="text-xs text-destructive">
                  {form2.formState.errors.adminEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="adminPassword">Contraseña *</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                {...form2.register("adminPassword")}
              />
              {form2.formState.errors.adminPassword && (
                <p className="text-xs text-destructive">
                  {form2.formState.errors.adminPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {serverError}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-10 shrink-0 px-0"
                onClick={() => setStep(1)}
                aria-label="Volver"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={form2.formState.isSubmitting}
              >
                {form2.formState.isSubmitting
                  ? "Creando taller…"
                  : "Crear taller"}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Al registrarte aceptas nuestros términos de uso.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
        done
          ? "bg-primary text-primary-foreground"
          : active
            ? "border-2 border-primary text-primary"
            : "border border-border text-muted-foreground"
      }`}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : label}
    </div>
  );
}
