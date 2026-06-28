"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { setToken, getUser } from "@/lib/auth";
import { setPortalToken } from "@/lib/portalAuth";
import portalApi from "@/lib/portalApi";
import { LogoMark } from "@/components/brand/Logo";

// ─── Staff login ────────────────────────────────────────────────────────────

const staffSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
type StaffForm = z.infer<typeof staffSchema>;

// ─── Client login ────────────────────────────────────────────────────────────

const clientSchema = z.object({
  documentId: z.string().min(3, "Cédula requerida"),
  password: z.string().min(1, "Contraseña requerida"),
});
type ClientForm = z.infer<typeof clientSchema>;

// ─── Tenant search ───────────────────────────────────────────────────────────

interface TenantResult {
  name: string;
  slug: string;
  city: string | null;
}

function TenantSearch({ onSelect }: { onSelect: (t: TenantResult) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TenantResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<{ data: TenantResult[] }>(
          `/api/tenants/public/search?q=${encodeURIComponent(q.trim())}`
        );
        setResults(res.data.data ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [q]);

  function pick(t: TenantResult) {
    setOpen(false);
    setQ(t.name);
    onSelect(t);
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca tu taller…"
          className="w-full rounded-lg border border-border bg-card pl-9 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {q && (
          <button
            type="button"
            onClick={() => { setQ(""); setResults([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
          {loading && (
            <li className="px-4 py-2 text-sm text-muted-foreground">Buscando…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-4 py-2 text-sm text-muted-foreground">
              No se encontró ningún taller.
            </li>
          )}
          {results.map((t) => (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => pick(t)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-foreground">{t.name}</span>
                {t.city && (
                  <span className="ml-1.5 text-muted-foreground text-xs">
                    · {t.city}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Staff login form ────────────────────────────────────────────────────────

function StaffLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<StaffForm>({ resolver: zodResolver(staffSchema) });

  async function onSubmit(data: StaffForm) {
    setServerError(null);
    try {
      const res = await api.post<{ data: { token: string } }>("/api/auth/login", data);
      setToken(res.data.data.token);
      const user = getUser();
      router.push(user?.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/dashboard");
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
          ?? "Credenciales incorrectas"
      );
    }
  }

  return (
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
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
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
        <Link href="/register" className="text-primary hover:underline">Créalo gratis</Link>
      </p>
    </form>
  );
}

// ─── Client login form ───────────────────────────────────────────────────────

function ClientLoginForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ClientForm>({ resolver: zodResolver(clientSchema) });

  async function onSubmit(data: ClientForm) {
    setServerError(null);
    try {
      const res = await portalApi.post<{ data: { token: string } }>(
        "/api/portal/auth/login",
        { tenantSlug: slug, documentId: data.documentId.trim(), password: data.password }
      );
      setPortalToken(res.data.data.token);
      router.push(`/portal/${slug}/mis-vehiculos`);
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
          ?? "Credenciales incorrectas"
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <Label htmlFor="documentId">Cédula</Label>
        <Input
          id="documentId"
          type="text"
          placeholder="000-0000000-0"
          autoComplete="username"
          {...register("documentId")}
        />
        {errors.documentId && (
          <p className="text-xs text-destructive">{errors.documentId.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="clientPassword">Contraseña</Label>
        <Input
          id="clientPassword"
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
    </form>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

function LoginPageInner() {
  const searchParams = useSearchParams();
  const tallerParam = searchParams.get("taller");

  const [mode, setMode] = useState<"staff" | "client">(
    tallerParam ? "client" : "staff"
  );
  const [selectedTaller, setSelectedTaller] = useState<TenantResult | null>(null);

  const activeSlug = tallerParam ?? selectedTaller?.slug ?? null;

  return (
    <Card className="w-full max-w-sm border-border bg-card shadow-2xl shadow-black/40">
      <CardHeader className="space-y-3 text-center">
        <div className="flex justify-center lg:hidden">
          <LogoMark className="h-10 w-10" />
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg border border-border overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setMode("staff")}
            className={`flex-1 py-1.5 font-medium transition-colors ${
              mode === "staff"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Empleado
          </button>
          <button
            type="button"
            onClick={() => setMode("client")}
            className={`flex-1 py-1.5 font-medium transition-colors ${
              mode === "client"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cliente
          </button>
        </div>

        <div className="space-y-1">
          <CardTitle className="font-display text-xl font-bold tracking-tight">
            {mode === "staff" ? "Bienvenido de nuevo" : "Portal del Cliente"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === "staff"
              ? "Ingresa a tu taller en GarageFlow"
              : "Consulta tus vehículos y facturas"}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {mode === "client" && !activeSlug && (
          <div className="space-y-1">
            <Label>Tu taller</Label>
            <TenantSearch onSelect={setSelectedTaller} />
            {selectedTaller && (
              <p className="text-xs text-muted-foreground">
                Taller seleccionado:{" "}
                <span className="font-medium text-foreground">{selectedTaller.name}</span>
              </p>
            )}
          </div>
        )}

        {mode === "client" && activeSlug && (
          <>
            {!tallerParam && selectedTaller && (
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{selectedTaller.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTaller(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cambiar
                </button>
              </div>
            )}
            {tallerParam && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Taller: </span>
                <span className="font-medium text-foreground">{tallerParam}</span>
              </div>
            )}
            <ClientLoginForm slug={activeSlug} />
          </>
        )}

        {mode === "client" && !activeSlug && selectedTaller === null && (
          <p className="text-center text-xs text-muted-foreground pt-1">
            Busca tu taller para continuar.
          </p>
        )}

        {mode === "staff" && <StaffLoginForm />}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
