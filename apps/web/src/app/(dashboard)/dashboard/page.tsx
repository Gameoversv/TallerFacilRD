"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Car,
  CheckCircle2,
  ClipboardList,
  Flag,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import {
  useDashboardSummary,
  useDashboardActivity,
  useDashboardAlerts,
} from "@/hooks/useDashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: summaryData, isLoading: loadingS } = useDashboardSummary();
  const { data: activityData, isLoading: loadingA } = useDashboardActivity();
  const { data: alertsData } = useDashboardAlerts();

  const s = summaryData?.data;
  const activity = activityData?.data ?? [];
  const alerts = alertsData?.data ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel del taller"
        title="Dashboard"
        description="Estado operativo en vivo · se actualiza cada 60 segundos."
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loadingS ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] rounded-xl" />
          ))
        ) : (
          <>
            <Link href="/ordenes?status=EN_PROGRESO">
              <StatCard
                label="Vehículos en taller"
                value={String(s?.vehiculos_en_taller ?? 0)}
                icon={Wrench}
                accent="primary"
                hint="En proceso ahora mismo"
              />
            </Link>
            <Link href="/ordenes?status=COMPLETADA">
              <StatCard
                label="Listos para entrega"
                value={String(s?.vehiculos_listos ?? 0)}
                icon={CheckCircle2}
                accent="success"
                hint="Esperando retiro del cliente"
              />
            </Link>
            <Link href="/ordenes">
              <StatCard
                label="Órdenes abiertas"
                value={String(s?.ordenes_abiertas ?? 0)}
                icon={ClipboardList}
                accent="warning"
                hint="Requieren seguimiento"
              />
            </Link>
            <StatCard
              label="Completadas hoy"
              value={String(s?.ordenes_completadas_hoy ?? 0)}
              icon={Flag}
              accent="success"
              hint="Cierres del día"
            />
            <Link href="/clientes">
              <StatCard
                label="Total clientes"
                value={String(s?.total_clientes ?? 0)}
                icon={Users}
                accent="primary"
              />
            </Link>
            <Link href="/vehiculos">
              <StatCard
                label="Total vehículos"
                value={String(s?.total_vehiculos ?? 0)}
                icon={Car}
                accent="primary"
              />
            </Link>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Activity Feed */}
        <section className="rounded-xl border border-border bg-card xl:col-span-2">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-sm font-semibold text-white">
              Actividad reciente
            </h2>
            <span className="text-xs text-muted-foreground">Últimos eventos</span>
          </header>
          <div className="p-2">
            {loadingA ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Sin actividad reciente
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((ev) => {
                  const isReception = ev.type === "RECEPTION";
                  const Icon = isReception ? Car : Wrench;
                  return (
                    <li
                      key={ev.entity_id}
                      className="flex items-start gap-3 px-3 py-3 transition-colors hover:bg-muted/40"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {ev.description}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {isReception ? "Recepción" : "Orden"} ·{" "}
                          {new Date(ev.occurred_at).toLocaleString("es-DO", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      {isReception && (
                        <Link
                          href={`/recepciones/${ev.entity_id}`}
                          className="mt-1 inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                          Ver <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Alerts */}
        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-sm font-semibold text-white">
              Alertas
            </h2>
            {alerts.length > 0 && (
              <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                {alerts.length}
              </span>
            )}
          </header>
          <div className="p-3">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-success/12 text-success">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <p className="text-sm text-muted-foreground">
                  Sin alertas activas
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {alerts.map((a) => (
                  <li key={a.entity_id}>
                    <Link
                      href={`/ordenes/${a.entity_id}`}
                      className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/8 p-3 transition-colors hover:border-destructive/40"
                    >
                      <span className="mt-0.5 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {a.description}
                        </p>
                        <p className="mt-0.5 text-xs text-destructive/90">
                          OT abierta hace {a.days_open} días
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
