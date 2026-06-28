"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Clock, Wrench, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import portalApi from "@/lib/portalApi";

interface ItemSummary {
  type: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  status: string;
  total: number;
}

interface WorkOrderSummary {
  id: string;
  status: string;
  items: ItemSummary[];
  invoices: InvoiceSummary[];
}

interface VisitSummary {
  receptionId: string;
  receptionDate: string;
  complaint: string;
  workOrder: WorkOrderSummary | null;
}

interface VehicleHistory {
  vehicleId: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  customerName: string;
  totalVisits: number;
  visits: VisitSummary[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

const STATUS_COLOR: Record<string, string> = {
  PENDIENTE: "bg-warning/15 text-warning",
  EN_PROGRESO: "bg-primary/15 text-primary",
  COMPLETADA: "bg-success/15 text-success",
  CANCELADA: "bg-destructive/15 text-destructive",
};

function useVehicleHistory(vehicleId: string) {
  return useQuery({
    queryKey: ["portal", "vehicle-history", vehicleId],
    queryFn: async () => {
      const res = await portalApi.get<{ data: VehicleHistory }>(
        `/api/portal/vehicles/${vehicleId}/history`
      );
      return res.data.data;
    },
  });
}

export default function PortalVehicleHistoryPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const { data: history, isLoading, isError } = useVehicleHistory(id);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando historial…
      </div>
    );
  }

  if (isError || !history) {
    return <p className="text-sm text-destructive">Vehículo no encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/portal/${slug}/mis-vehiculos`}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Mis Vehículos
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {history.brand} {history.model}{" "}
          <span className="font-normal text-muted-foreground">{history.year}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {history.licensePlate} · {history.totalVisits} visita{history.totalVisits !== 1 ? "s" : ""}
        </p>
      </div>

      {history.visits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Sin visitas registradas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.visits.map((visit) => (
            <div
              key={visit.receptionId}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-muted/30">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {visit.receptionDate
                      ? new Date(visit.receptionDate).toLocaleDateString("es-DO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                {visit.workOrder && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[visit.workOrder.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {STATUS_LABEL[visit.workOrder.status] ?? visit.workOrder.status}
                  </span>
                )}
              </div>

              <div className="px-5 py-4 space-y-4">
                {visit.complaint && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Problema reportado
                    </p>
                    <p className="text-sm text-foreground">{visit.complaint}</p>
                  </div>
                )}

                {visit.workOrder && visit.workOrder.items.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                      <Wrench className="h-3.5 w-3.5" />
                      Servicios / Piezas
                    </div>
                    <ul className="space-y-1">
                      {visit.workOrder.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground">{item.description}</span>
                          <span className="text-muted-foreground nums">
                            ×{item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {visit.workOrder && visit.workOrder.invoices.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                      <FileText className="h-3.5 w-3.5" />
                      Facturas
                    </div>
                    <ul className="space-y-2">
                      {visit.workOrder.invoices.map((inv) => (
                        <li
                          key={inv.id}
                          className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            {inv.status === "PAGADA" ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-warning" />
                            )}
                            <Link
                              href={`/portal/${slug}/mis-facturas/${inv.id}`}
                              className="text-sm font-medium text-primary hover:underline nums"
                            >
                              {inv.invoiceNumber}
                            </Link>
                          </div>
                          <span className="nums text-sm font-semibold text-foreground">
                            RD$ {Number(inv.total).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
