"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import type { WorkOrderStatus } from "@/types/work-order";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  PENDIENTE: "bg-warning/15 text-warning",
  EN_PROGRESO: "bg-primary/15 text-primary",
  COMPLETADA: "bg-success/15 text-success",
  CANCELADA: "bg-muted text-muted-foreground",
};

const STATUS_FILTERS: Array<{ label: string; value: WorkOrderStatus | null }> = [
  { label: "Todas", value: null },
  { label: "Pendientes", value: "PENDIENTE" },
  { label: "En progreso", value: "EN_PROGRESO" },
  { label: "Completadas", value: "COMPLETADA" },
  { label: "Canceladas", value: "CANCELADA" },
];

export default function OrdenesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | null>(null);
  const [page, setPage] = useState(0);

  const { data, isLoading } = useWorkOrders(statusFilter, page);
  const orders = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const columns: ResponsiveColumn<(typeof orders)[number]>[] = [
    {
      header: "Vehículo",
      primary: true,
      cell: (o) => <span className="font-medium">{o.vehicle_label}</span>,
    },
    { header: "Cliente", cell: (o) => o.customer_name },
    { header: "Técnico", cell: (o) => o.assigned_to ?? "—" },
    {
      header: "Estado",
      cell: (o) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}
        >
          {STATUS_LABELS[o.status]}
        </span>
      ),
    },
    {
      header: "Costo est.",
      className: "text-right",
      cell: (o) =>
        o.estimated_cost != null ? `RD$${o.estimated_cost.toLocaleString()}` : "—",
    },
    {
      header: "Fecha",
      cell: (o) => (
        <span className="text-muted-foreground text-sm">
          {new Date(o.created_at).toLocaleDateString("es-DO")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Órdenes de trabajo"
        description={`${total} registros`}
        actions={
          <Button onClick={() => router.push("/ordenes/nueva")} className="w-full sm:w-auto">
            + Nueva orden
          </Button>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => {
              setStatusFilter(f.value);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              statusFilter === f.value
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ResponsiveList
        items={orders}
        columns={columns}
        getKey={(o) => o.id}
        onRowClick={(o) => router.push(`/ordenes/${o.id}`)}
        isLoading={isLoading}
        emptyMessage="Sin resultados"
      />

      {totalPages > 1 && (
        <div className="flex gap-2 items-center justify-end text-sm">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Anterior
          </Button>
          <span className="text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  );
}
