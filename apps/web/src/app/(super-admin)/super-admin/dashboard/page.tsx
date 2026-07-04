"use client";

import Link from "next/link";
import { Building2, Users, Car, ClipboardList, TrendingUp, Clock, Ban, XCircle, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { useSuperAdminStats, useExpiringTrials, useRecentTenants, useExtendTrial, type TenantSummary } from "@/hooks/useSuperAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const MRR_BY_PLAN: Record<TenantSummary["plan"], number> = {
  STARTER: 0,
  PRO: 29,
  ENTERPRISE: 99,
};

const STATUS_COLORS: Record<TenantSummary["status"], string> = {
  PENDING: "bg-violet-400/15 text-violet-400",
  TRIAL: "bg-amber-400/15 text-amber-400",
  ACTIVE: "bg-emerald-400/15 text-emerald-400",
  SUSPENDED: "bg-orange-400/15 text-orange-400",
  CANCELLED: "bg-rose-400/15 text-rose-400",
};

const STATUS_LABELS: Record<TenantSummary["status"], string> = {
  PENDING: "Pendiente",
  TRIAL: "Trial",
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  CANCELLED: "Cancelado",
};

export default function SuperAdminDashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useSuperAdminStats();
  const { data: expiringData } = useExpiringTrials();
  const { data: recentData } = useRecentTenants();
  const extendTrial = useExtendTrial();

  const s = statsData?.data;
  const expiring = expiringData?.data ?? [];
  const recent = recentData?.data ?? [];

  const estimatedMrr = recent.reduce((acc, t) => {
    if (t.status === "ACTIVE") acc += MRR_BY_PLAN[t.plan];
    return acc;
  }, 0);

  // Better MRR from stats: active × avg price (rough)
  const mrrEstimate = (s?.tenants_active ?? 0) * 29;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">WorkshopTrack HQ</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Dashboard global</h1>
        <p className="text-sm text-muted-foreground">Vista en tiempo real de toda la plataforma</p>
      </div>

      {/* Expiring trials alert */}
      {expiring.length > 0 && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <p className="text-sm font-semibold text-amber-400">
              {expiring.length} taller{expiring.length > 1 ? "es" : ""} con trial por vencer (≤7 días)
            </p>
          </div>
          <div className="space-y-2">
            {expiring.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Vence: {new Date(t.trial_ends_at).toLocaleDateString("es-DO")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={extendTrial.isPending}
                  onClick={() => extendTrial.mutate({ id: t.id, days: 30 })}
                >
                  +30 días
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tenant status strip */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Talleres por estado
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatusCard label="Pendientes" value={s?.tenants_pending} icon={Clock} color="text-violet-400" bg="bg-violet-400/10" loading={statsLoading} />
          <StatusCard label="En trial" value={s?.tenants_trial} icon={Clock} color="text-amber-400" bg="bg-amber-400/10" loading={statsLoading} />
          <StatusCard label="Activos" value={s?.tenants_active} icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-400/10" loading={statsLoading} />
          <StatusCard label="Suspendidos" value={s?.tenants_suspended} icon={Ban} color="text-orange-400" bg="bg-orange-400/10" loading={statsLoading} />
          <StatusCard label="Cancelados" value={s?.tenants_cancelled} icon={XCircle} color="text-rose-400" bg="bg-rose-400/10" loading={statsLoading} />
        </div>
      </section>

      {/* Global KPIs + MRR */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Totales de la plataforma
        </h2>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <KpiCard label="MRR estimado" value={"$" + mrrEstimate.toLocaleString("es-DO")} icon={DollarSign} loading={statsLoading} highlight />
          <KpiCard label="Talleres" value={s?.tenants_total} icon={Building2} loading={statsLoading} />
          <KpiCard label="Usuarios" value={s?.users_total} icon={Users} loading={statsLoading} />
          <KpiCard label="Vehículos" value={s?.vehicles_total} icon={Car} loading={statsLoading} />
          <KpiCard label="Órdenes" value={s?.work_orders_total} icon={ClipboardList} loading={statsLoading} />
        </div>
      </section>

      {/* Recent tenants */}
      {recent.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Últimos talleres registrados
            </h2>
            <Link href="/super-admin/talleres" className="text-xs text-primary hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {["Taller", "Plan", "Estado", "Usuarios", "Registrado"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/super-admin/talleres/${t.id}`} className="font-medium hover:text-primary">
                        {t.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{t.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.user_count}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString("es-DO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, loading, highlight }: {
  label: string; value?: number | string; icon: React.ElementType; loading: boolean; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${highlight ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className={`mt-3 font-display text-3xl font-bold ${highlight ? "text-primary" : ""}`}>
          {typeof value === "number" ? value.toLocaleString("es-DO") : (value ?? 0)}
        </p>
      )}
    </div>
  );
}

function StatusCard({ label, value, icon: Icon, color, bg, loading }: {
  label: string; value?: number; icon: React.ElementType; color: string; bg: string; loading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-1 h-6 w-10" /> : <p className="font-display text-xl font-bold">{value ?? 0}</p>}
      </div>
    </div>
  );
}
