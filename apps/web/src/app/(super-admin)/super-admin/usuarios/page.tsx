"use client";

import { useState } from "react";
import { useUserSearch, useResetUserPassword, type UserSummary } from "@/hooks/useSuperAdmin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, KeyRound } from "lucide-react";
import Link from "next/link";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";
import {
  ResetPasswordDialog,
  type ResetPasswordResult,
} from "@/components/super-admin/ResetPasswordDialog";

export default function UsuariosPage() {
  const [email, setEmail] = useState("");
  const { data, isLoading } = useUserSearch(email);
  const resetPassword = useResetUserPassword();
  const [resetResult, setResetResult] = useState<ResetPasswordResult | null>(null);

  const users = data?.data?.content ?? [];
  const total = data?.data?.total_elements ?? 0;

  async function handleResetPassword(userId: string, userEmail: string) {
    const result = await resetPassword.mutateAsync(userId);
    setResetResult({ email: userEmail, temporaryPassword: result.temporary_password });
  }

  const columns: ResponsiveColumn<UserSummary>[] = [
    { header: "Nombre", primary: true, cell: (u) => u.name },
    { header: "Email", cell: (u) => u.email },
    {
      header: "Rol",
      cell: (u) => (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{u.role}</span>
      ),
    },
    {
      header: "Taller",
      cell: (u) =>
        u.tenant_id ? (
          <Link href={`/super-admin/talleres/${u.tenant_id}`} className="text-xs text-primary hover:underline font-mono">
            {u.tenant_id.slice(0, 8)}…
          </Link>
        ) : "—",
    },
    {
      header: "Estado",
      cell: (u) => (
        <span className={`text-xs font-medium ${u.active ? "text-emerald-400" : "text-rose-400"}`}>
          {u.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "",
      isAction: true,
      cell: (u) => (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={resetPassword.isPending}
          onClick={() => handleResetPassword(u.id, u.email)}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Resetear contraseña
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">WorkshopTrack HQ</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Búsqueda de usuarios</h1>
        <p className="text-sm text-muted-foreground">Busca usuarios a través de todos los talleres</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por email…"
          className="pl-9"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {email.length < 2 ? (
        <p className="text-sm text-muted-foreground">Escribe al menos 2 caracteres para buscar.</p>
      ) : (
        <>
          {total > 0 && <p className="text-xs text-muted-foreground">{total} resultado{total > 1 ? "s" : ""}</p>}
          <ResponsiveList
            items={users}
            columns={columns}
            getKey={(u) => u.id}
            isLoading={isLoading}
            emptyMessage="Sin resultados"
          />
        </>
      )}

      <ResetPasswordDialog result={resetResult} onClose={() => setResetResult(null)} />
    </div>
  );
}
