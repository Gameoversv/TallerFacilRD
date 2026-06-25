"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import type { WorkOrderStatus } from "@/types/work-order";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Órdenes de trabajo</h1>
          <p className="text-sm text-muted-foreground">{total} registros</p>
        </div>
        <Button onClick={() => router.push("/ordenes/nueva")}>+ Nueva orden</Button>
      </div>

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

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehículo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Costo est.</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Sin resultados
                  </TableCell>
                </TableRow>
              )}
              {orders.map((o) => (
                <TableRow
                  key={o.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => router.push(`/ordenes/${o.id}`)}
                >
                  <TableCell className="font-medium">{o.vehicle_label}</TableCell>
                  <TableCell>{o.customer_name}</TableCell>
                  <TableCell>{o.assigned_to ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}
                    >
                      {STATUS_LABELS[o.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {o.estimated_cost != null
                      ? `RD$${o.estimated_cost.toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(o.created_at).toLocaleDateString("es-DO")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
