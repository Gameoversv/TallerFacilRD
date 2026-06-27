"use client";

import { useState } from "react";
import {
  useSuperAdminTenants,
  useUpdateTenantStatus,
  useUpdateTenantPlan,
  type TenantSummary,
} from "@/hooks/useSuperAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_LABELS: Record<TenantSummary["status"], string> = {
  TRIAL: "Trial",
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<TenantSummary["status"], string> = {
  TRIAL: "bg-amber-400/15 text-amber-400",
  ACTIVE: "bg-emerald-400/15 text-emerald-400",
  SUSPENDED: "bg-orange-400/15 text-orange-400",
  CANCELLED: "bg-rose-400/15 text-rose-400",
};

const PLAN_LABELS: Record<TenantSummary["plan"], string> = {
  STARTER: "Starter",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

export default function TalleresPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const { data, isLoading } = useSuperAdminTenants(q || undefined, page);
  const updateStatus = useUpdateTenantStatus();
  const updatePlan = useUpdateTenantPlan();

  const tenants = data?.data?.content ?? [];
  const total = data?.data?.total_elements ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          GarageFlow HQ
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
          Talleres
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} talleres registrados en la plataforma
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre…"
          className="pl-9"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {["Taller", "Plan", "Estado", "Usuarios", "Clientes", "Órdenes", "Registrado", "Acciones"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              : tenants.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      Sin talleres registrados
                    </td>
                  </tr>
                )
                : tenants.map((t) => (
                  <TenantRow
                    key={t.id}
                    tenant={t}
                    onStatusChange={(status) => updateStatus.mutate({ id: t.id, status })}
                    onPlanChange={(plan) => updatePlan.mutate({ id: t.id, plan })}
                  />
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TenantRow({
  tenant: t,
  onStatusChange,
  onPlanChange,
}: {
  tenant: TenantSummary;
  onStatusChange: (s: TenantSummary["status"]) => void;
  onPlanChange: (p: TenantSummary["plan"]) => void;
}) {
  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <p className="font-medium text-white">{t.name}</p>
        <p className="text-xs text-muted-foreground">{t.slug}</p>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {PLAN_LABELS[t.plan]}
        </span>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
              Acciones <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={t.status === "ACTIVE"}
              onClick={() => onStatusChange("ACTIVE")}
            >
              Activar
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={t.status === "SUSPENDED"}
              onClick={() => onStatusChange("SUSPENDED")}
            >
              Suspender
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={t.status === "CANCELLED"}
              onClick={() => onStatusChange("CANCELLED")}
            >
              Cancelar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={t.plan === "STARTER"}
              onClick={() => onPlanChange("STARTER")}
            >
              Plan Starter
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={t.plan === "PRO"}
              onClick={() => onPlanChange("PRO")}
            >
              Plan Pro
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={t.plan === "ENTERPRISE"}
              onClick={() => onPlanChange("ENTERPRISE")}
            >
              Plan Enterprise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
