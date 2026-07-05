"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Users, Car, ClipboardList, LogIn, Clock } from "lucide-react";
import { useTenantDetail, useImpersonate, useExtendTrial, useUpdateTenantStatus, useAuditLog } from "@/hooks/useSuperAdmin";
import { startImpersonation } from "@/components/ImpersonationBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const STATUS_COLORS = {
  PENDING: "bg-violet-400/15 text-violet-400",
  TRIAL: "bg-amber-400/15 text-amber-400",
  ACTIVE: "bg-emerald-400/15 text-emerald-400",
  SUSPENDED: "bg-orange-400/15 text-orange-400",
  CANCELLED: "bg-rose-400/15 text-rose-400",
};
const STATUS_LABELS = {
  PENDING: "Pendiente", TRIAL: "Trial", ACTIVE: "Activo",
  SUSPENDED: "Suspendido", CANCELLED: "Cancelado",
};

const ACTION_LABELS: Record<string, string> = {
  APPROVE: "Aprobado", STATUS_CHANGE: "Cambio de estado",
  PLAN_CHANGE: "Cambio de plan", EXTEND_TRIAL: "Trial extendido",
  IMPERSONATE: "Impersonación",
};

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useTenantDetail(id);
  const { data: auditData } = useAuditLog(id, 0);
  const impersonate = useImpersonate();
  const extendTrial = useExtendTrial();
  const updateStatus = useUpdateTenantStatus();

  const t = data?.data;
  const audit = auditData?.data?.content ?? [];

  function handleImpersonate() {
    impersonate.mutate(id, {
      onSuccess: (res) => { startImpersonation(res.token); router.push("/dashboard"); },
    });
  }

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  );

  if (!t) return <p className="text-muted-foreground">Taller no encontrado</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/super-admin/talleres" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Volver a talleres
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{t.name}</h1>
            <p className="text-sm text-muted-foreground">{t.slug} · {t.country}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleImpersonate} className="w-full gap-2 sm:w-auto">
              <LogIn className="h-4 w-4" /> Acceder como taller
            </Button>
            {(t.status === "TRIAL" || t.status === "PENDING") && (
              <Button variant="outline" size="sm" onClick={() => extendTrial.mutate({ id, days: 30 })} className="w-full gap-2 sm:w-auto">
                <Clock className="h-4 w-4" /> +30 días trial
              </Button>
            )}
            {t.status === "ACTIVE" && (
              <Button variant="outline" size="sm"
                className="w-full border-orange-400/40 text-orange-400 hover:bg-orange-400/10 sm:w-auto"
                onClick={() => updateStatus.mutate({ id, status: "SUSPENDED" })}>
                Suspender
              </Button>
            )}
            {t.status === "SUSPENDED" && (
              <Button variant="outline" size="sm"
                className="w-full border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10 sm:w-auto"
                onClick={() => updateStatus.mutate({ id, status: "ACTIVE" })}>
                Reactivar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info + Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Información</h2>
          <Row label="Estado">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status]}`}>
              {STATUS_LABELS[t.status]}
            </span>
          </Row>
          <Row label="Plan">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t.plan}</span>
          </Row>
          {t.trial_ends_at && <Row label="Trial vence">{new Date(t.trial_ends_at).toLocaleDateString("es-DO")}</Row>}
          {t.city && <Row label="Ciudad">{t.city}</Row>}
          {t.phone && <Row label="Teléfono">{t.phone}</Row>}
          {t.email && <Row label="Email">{t.email}</Row>}
          {t.rnc && <Row label="RNC">{t.rnc}</Row>}
          <Row label="Registrado">{new Date(t.created_at).toLocaleDateString("es-DO")}</Row>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <MiniKpi label="Usuarios" value={t.user_count} icon={Users} />
          <MiniKpi label="Clientes" value={t.customer_count} icon={Building2} />
          <MiniKpi label="Vehículos" value={t.vehicle_count} icon={Car} />
          <MiniKpi label="Órdenes" value={t.order_count} icon={ClipboardList} />
        </div>
      </div>

      {/* Owners */}
      {t.owners.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usuarios del taller</h2>
          <div className="w-full overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {["Nombre", "Email", "Rol", "Estado"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {t.owners.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${u.active ? "text-emerald-400" : "text-rose-400"}`}>
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Audit log */}
      {audit.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial de acciones</h2>
          <div className="space-y-2">
            {audit.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-card/50 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{ACTION_LABELS[a.action] ?? a.action}</p>
                  {a.detail && <p className="text-xs text-muted-foreground">{a.detail}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">por {a.actor_email}</p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString("es-DO")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

function MiniKpi({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value.toLocaleString("es-DO")}</p>
    </div>
  );
}
