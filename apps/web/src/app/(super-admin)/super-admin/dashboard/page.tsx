"use client";

import { Building2, Users, Car, ClipboardList, TrendingUp, Clock, Ban, XCircle } from "lucide-react";
import { useSuperAdminStats } from "@/hooks/useSuperAdmin";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminDashboardPage() {
  const { data, isLoading } = useSuperAdminStats();
  const s = data?.data;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          GarageFlow HQ
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
          Dashboard global
        </h1>
        <p className="text-sm text-muted-foreground">
          Vista en tiempo real de toda la plataforma
        </p>
      </div>

      {/* Tenant status strip */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Talleres por estado
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatusCard
            label="En trial"
            value={s?.tenants_trial}
            icon={Clock}
            color="text-amber-400"
            bg="bg-amber-400/10"
            loading={isLoading}
          />
          <StatusCard
            label="Activos"
            value={s?.tenants_active}
            icon={TrendingUp}
            color="text-emerald-400"
            bg="bg-emerald-400/10"
            loading={isLoading}
          />
          <StatusCard
            label="Suspendidos"
            value={s?.tenants_suspended}
            icon={Ban}
            color="text-orange-400"
            bg="bg-orange-400/10"
            loading={isLoading}
          />
          <StatusCard
            label="Cancelados"
            value={s?.tenants_cancelled}
            icon={XCircle}
            color="text-rose-400"
            bg="bg-rose-400/10"
            loading={isLoading}
          />
        </div>
      </section>

      {/* Global KPIs */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Totales de la plataforma
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Talleres"
            value={s?.tenants_total}
            icon={Building2}
            loading={isLoading}
          />
          <KpiCard
            label="Usuarios"
            value={s?.users_total}
            icon={Users}
            loading={isLoading}
          />
          <KpiCard
            label="Vehículos"
            value={s?.vehicles_total}
            icon={Car}
            loading={isLoading}
          />
          <KpiCard
            label="Órdenes de trabajo"
            value={s?.work_orders_total}
            icon={ClipboardList}
            loading={isLoading}
          />
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value?: number;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-3 font-display text-3xl font-bold">
          {(value ?? 0).toLocaleString("es-DO")}
        </p>
      )}
    </div>
  );
}

function StatusCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  loading,
}: {
  label: string;
  value?: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-10" />
        ) : (
          <p className="font-display text-xl font-bold">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}
