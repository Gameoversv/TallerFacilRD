"use client";

import Link from "next/link";
import { useDashboardSummary, useDashboardActivity, useDashboardAlerts } from "@/hooks/useDashboard";

function KpiCard({
  label,
  value,
  icon,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  icon: string;
  href?: string;
  accent?: "green" | "blue" | "yellow" | "red";
}) {
  const accentClass = {
    green: "border-l-green-500",
    blue: "border-l-blue-500",
    yellow: "border-l-yellow-500",
    red: "border-l-red-500",
  }[accent ?? "blue"] ?? "border-l-gray-300";

  const card = (
    <div
      className={`bg-white rounded-lg border border-l-4 ${accentClass} p-5 flex items-center gap-4 hover:shadow-sm transition-shadow`}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />;
}

export default function DashboardPage() {
  const { data: summaryData, isLoading: loadingS } = useDashboardSummary();
  const { data: activityData, isLoading: loadingA } = useDashboardActivity();
  const { data: alertsData } = useDashboardAlerts();

  const s = summaryData?.data;
  const activity = activityData?.data ?? [];
  const alerts = alertsData?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen del taller · actualiza cada 60s
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {loadingS ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <KpiCard
              label="Vehículos en taller"
              value={s?.vehiculos_en_taller ?? 0}
              icon="🔧"
              href="/ordenes?status=EN_PROGRESO"
              accent="blue"
            />
            <KpiCard
              label="Listos para entrega"
              value={s?.vehiculos_listos ?? 0}
              icon="✅"
              href="/ordenes?status=COMPLETADA"
              accent="green"
            />
            <KpiCard
              label="Órdenes abiertas"
              value={s?.ordenes_abiertas ?? 0}
              icon="📋"
              href="/ordenes"
              accent="yellow"
            />
            <KpiCard
              label="Completadas hoy"
              value={s?.ordenes_completadas_hoy ?? 0}
              icon="🏁"
              accent="green"
            />
            <KpiCard
              label="Total clientes"
              value={s?.total_clientes ?? 0}
              icon="👥"
              href="/clientes"
            />
            <KpiCard
              label="Total vehículos"
              value={s?.total_vehiculos ?? 0}
              icon="🚗"
              href="/vehiculos"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="bg-white rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Actividad reciente</h2>
          {loadingA ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Sin actividad reciente</p>
          ) : (
            <ul className="divide-y">
              {activity.map((ev) => (
                <li key={ev.entity_id} className="py-3 flex items-start gap-3">
                  <span className="text-lg mt-0.5">
                    {ev.type === "RECEPTION" ? "🚗" : "🔧"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {ev.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ev.type === "RECEPTION" ? "Recepción" : "Orden"} ·{" "}
                      {new Date(ev.occurred_at).toLocaleString("es-DO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  {ev.type === "RECEPTION" && (
                    <Link
                      href={`/recepciones/${ev.entity_id}`}
                      className="text-xs text-gray-400 hover:text-gray-700 shrink-0"
                    >
                      Ver →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Alertas</h2>
            {alerts.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl">✅</p>
              <p className="text-sm text-gray-400 mt-2">Sin alertas activas</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {alerts.map((a) => (
                <li
                  key={a.entity_id}
                  className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-3"
                >
                  <span className="text-lg">⚠️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800 truncate">
                      {a.description}
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">
                      OT abierta hace {a.days_open} días
                    </p>
                  </div>
                  <Link
                    href={`/ordenes/${a.entity_id}`}
                    className="text-xs text-red-600 hover:text-red-800 font-medium shrink-0"
                  >
                    Ver →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
