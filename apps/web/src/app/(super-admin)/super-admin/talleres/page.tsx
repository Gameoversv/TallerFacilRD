"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useSuperAdminTenants, useUpdateTenantStatus, useUpdateTenantPlan,
  useImpersonate, useApproveTenant, useExtendTrial, type TenantSummary,
} from "@/hooks/useSuperAdmin";
import { startImpersonation } from "@/components/ImpersonationBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogIn, CheckCircle, Download } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";

const STATUS_LABELS: Record<TenantSummary["status"], string> = {
  PENDING: "Pendiente", TRIAL: "Trial", ACTIVE: "Activo",
  SUSPENDED: "Suspendido", CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<TenantSummary["status"], string> = {
  PENDING: "bg-violet-400/15 text-violet-400",
  TRIAL: "bg-amber-400/15 text-amber-400",
  ACTIVE: "bg-emerald-400/15 text-emerald-400",
  SUSPENDED: "bg-orange-400/15 text-orange-400",
  CANCELLED: "bg-rose-400/15 text-rose-400",
};

const STATUS_FILTER_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Todos", value: "" },
  { label: "Pendientes", value: "PENDING" },
  { label: "Trial", value: "TRIAL" },
  { label: "Activos", value: "ACTIVE" },
  { label: "Suspendidos", value: "SUSPENDED" },
  { label: "Cancelados", value: "CANCELLED" },
];

export default function TalleresPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useSuperAdminTenants(statusFilter || undefined, page);
  const updateStatus = useUpdateTenantStatus();
  const updatePlan = useUpdateTenantPlan();
  const impersonate = useImpersonate();
  const approveTenant = useApproveTenant();
  const extendTrial = useExtendTrial();

  const tenants = data?.data?.content ?? [];
  const total = data?.data?.total_elements ?? 0;
  const totalPages = Math.ceil(total / 20);

  function handleImpersonate(id: string) {
    impersonate.mutate(id, {
      onSuccess: (res) => { startImpersonation(res.token); router.push("/dashboard"); },
    });
  }

  async function handleExportCsv() {
    const res = await api.get("/api/super-admin/tenants", {
      params: { size: 1000, page: 0, status: statusFilter || undefined },
    });
    const rows: TenantSummary[] = res.data.data.content;
    const header = "ID,Nombre,Slug,Plan,Estado,Usuarios,Clientes,Órdenes,Registrado";
    const csv = [header, ...rows.map((t) =>
      [t.id, t.name, t.slug, t.plan, t.status, t.user_count, t.customer_count, t.order_count,
        new Date(t.created_at).toLocaleDateString("es-DO")].join(",")
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "talleres.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">WorkshopTrack HQ</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Talleres</h1>
          <p className="text-sm text-muted-foreground">{total} talleres registrados</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(0); }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {["Taller", "Plan", "Estado", "Usuarios", "Clientes", "Órdenes", "Registrado", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                ))}</tr>
              ))
              : tenants.length === 0
                ? <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">Sin talleres</td></tr>
                : tenants.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/super-admin/talleres/${t.id}`} className="font-medium hover:text-primary">
                        {t.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{t.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.user_count}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.customer_count}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.order_count}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString("es-DO")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.status === "PENDING" && (
                          <Button
                            size="sm" variant="outline"
                            className="h-7 gap-1 border-emerald-400/40 px-2 text-xs text-emerald-400 hover:bg-emerald-400/10"
                            disabled={approveTenant.isPending}
                            onClick={() => approveTenant.mutate(t.id)}
                          >
                            <CheckCircle className="h-3 w-3" /> Aprobar
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                              Acciones <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleImpersonate(t.id)}>
                              <LogIn className="mr-2 h-3.5 w-3.5" /> Acceder como taller
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => extendTrial.mutate({ id: t.id, days: 30 })}>
                              +30 días trial
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={t.status === "ACTIVE"} onClick={() => updateStatus.mutate({ id: t.id, status: "ACTIVE" })}>Activar</DropdownMenuItem>
                            <DropdownMenuItem disabled={t.status === "SUSPENDED"} onClick={() => updateStatus.mutate({ id: t.id, status: "SUSPENDED" })}>Suspender</DropdownMenuItem>
                            <DropdownMenuItem disabled={t.status === "CANCELLED"} onClick={() => updateStatus.mutate({ id: t.id, status: "CANCELLED" })}>Cancelar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={t.plan === "STARTER"} onClick={() => updatePlan.mutate({ id: t.id, plan: "STARTER" })}>Plan Starter</DropdownMenuItem>
                            <DropdownMenuItem disabled={t.plan === "PRO"} onClick={() => updatePlan.mutate({ id: t.id, plan: "PRO" })}>Plan Pro</DropdownMenuItem>
                            <DropdownMenuItem disabled={t.plan === "ENTERPRISE"} onClick={() => updatePlan.mutate({ id: t.id, plan: "ENTERPRISE" })}>Plan Enterprise</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
          </div>
        </div>
      )}
    </div>
  );
}
