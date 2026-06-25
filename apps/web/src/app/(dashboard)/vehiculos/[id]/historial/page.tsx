"use client";

import { use } from "react";
import Link from "next/link";
import { useVehicleHistory } from "@/hooks/useVehicleHistory";
import { Button } from "@/components/ui/button";

const WO_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En progreso",
  WAITING_PARTS: "Esperando piezas",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const WO_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-primary/15 text-primary",
  WAITING_PARTS: "bg-warning/15 text-warning",
  COMPLETED: "bg-success/15 text-success",
  CANCELLED: "bg-destructive/15 text-destructive",
};

const INV_STATUS_COLOR: Record<string, string> = {
  PENDIENTE: "bg-warning/15 text-warning",
  PAGADA: "bg-success/15 text-success",
  ANULADA: "bg-muted text-muted-foreground",
};

export default function VehicleHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useVehicleHistory(id);
  const history = data?.data;

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando historial...</p>;
  if (!history) return <p className="text-sm text-destructive">Vehículo no encontrado</p>;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/vehiculos">
            <Button variant="ghost" className="mb-2">← Vehículos</Button>
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            {history.license_plate ? `${history.license_plate} — ` : ""}
            {history.brand} {history.model} {history.year}
          </h1>
          <p className="text-sm text-muted-foreground">
            Cliente: {history.customer_name}
            {history.vin ? ` · VIN: ${history.vin}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-foreground">{history.total_visits}</p>
          <p className="text-xs text-muted-foreground">visitas totales</p>
        </div>
      </div>

      {/* Timeline */}
      {history.visits.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Sin visitas registradas para este vehículo
        </div>
      ) : (
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted" />

          <div className="space-y-6">
            {history.visits.map((visit, idx) => (
              <div key={visit.reception_id} className="relative pl-14">
                {/* dot */}
                <div className="absolute left-3.5 top-1.5 w-3 h-3 rounded-full bg-card border-2 border-border ring-2 ring-white" />

                <div className="rounded-lg border bg-card p-5 space-y-4 shadow-sm">
                  {/* Visit header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Visita #{history.total_visits - idx}
                      </p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {visit.reception_date
                          ? new Date(visit.reception_date).toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" })
                          : "Fecha no disponible"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{visit.complaint || "Sin motivo especificado"}</p>
                    </div>
                    <Link href={`/recepciones/${visit.reception_id}`}>
                      <Button variant="ghost" size="sm">Ver recepción</Button>
                    </Link>
                  </div>

                  {/* Work Order */}
                  {visit.work_order ? (
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Orden de trabajo</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WO_STATUS_COLOR[visit.work_order.status] ?? "bg-muted text-muted-foreground"}`}>
                            {WO_STATUS_LABEL[visit.work_order.status] ?? visit.work_order.status}
                          </span>
                        </div>
                        <Link href={`/ordenes/${visit.work_order.id}`}>
                          <Button variant="ghost" size="sm">Ver OT</Button>
                        </Link>
                      </div>

                      {/* Items */}
                      {visit.work_order.items.length > 0 && (
                        <div className="rounded-md bg-muted/40 p-3 space-y-1.5">
                          {visit.work_order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${item.type === "LABOR" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"}`}>
                                  {item.type === "LABOR" ? "Mano obra" : "Pieza"}
                                </span>
                                <span>{item.description}</span>
                              </div>
                              <span className="text-muted-foreground shrink-0 ml-4">
                                {item.quantity}x RD$ {item.unit_price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Invoices */}
                      {visit.work_order.invoices.length > 0 && (
                        <div className="space-y-1.5">
                          {visit.work_order.invoices.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{inv.invoice_number}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${INV_STATUS_COLOR[inv.status] ?? "bg-muted text-muted-foreground"}`}>
                                  {inv.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold">RD$ {inv.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                                <Link href={`/facturas/${inv.id}`}>
                                  <Button variant="ghost" size="sm">Ver</Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground border-t pt-3">Sin orden de trabajo asociada</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
