"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Clock,
  Wrench,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  PenLine,
} from "lucide-react";
import portalApi from "@/lib/portalApi";

interface ItemSummary {
  type: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceSummary {
  id: string;
  invoice_number: string;
  issue_date: string;
  status: string;
  total: number;
}

interface WorkOrderSummary {
  id: string;
  status: string;
  items: ItemSummary[];
  invoices: InvoiceSummary[];
}

type Severity = "OK" | "LEVE" | "GRAVE" | "NA";

interface ChecklistData {
  exterior?: { scratches?: Severity; dents?: Severity; lights?: Severity };
  interior?: { radio?: Severity; screen?: Severity; mats?: Severity };
  mechanical?: { oil_level?: Severity; coolant?: Severity; battery?: Severity };
}

interface VisitSummary {
  reception_id: string;
  reception_date: string;
  complaint: string;
  checklist?: ChecklistData;
  signature_data?: string;
  work_order: WorkOrderSummary | null;
}

interface VehicleHistory {
  vehicle_id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  customer_name: string;
  total_visits: number;
  visits: VisitSummary[];
}

const OT_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

const OT_COLOR: Record<string, string> = {
  PENDIENTE: "bg-warning/15 text-warning",
  EN_PROGRESO: "bg-primary/15 text-primary",
  COMPLETADA: "bg-success/15 text-success",
  CANCELADA: "bg-destructive/15 text-destructive",
};

const INV_COLOR: Record<string, string> = {
  PAGADA: "text-success",
  PENDIENTE: "text-warning",
  ANULADA: "text-muted-foreground",
};

function money(n: number) {
  return `RD$ ${Number(n).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
}

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

// Expandable reception card
function ReceptionCard({ visit, slug }: { visit: VisitSummary; slug: string }) {
  const [open, setOpen] = useState(false);
  const wo = visit.work_order;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {visit.reception_date
                ? new Date(visit.reception_date).toLocaleDateString("es-DO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
            {visit.complaint && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {visit.complaint}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {wo && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${OT_COLOR[wo.status] ?? "bg-muted text-muted-foreground"}`}
            >
              {OT_LABEL[wo.status] ?? wo.status}
            </span>
          )}
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-4 space-y-4 bg-muted/10">
          {visit.complaint && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Problema reportado
              </p>
              <p className="text-sm text-foreground">{visit.complaint}</p>
            </div>
          )}

          {visit.checklist && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                <ClipboardList className="h-3.5 w-3.5" />
                Inspección visual
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <ChecklistSection label="Exterior" items={[
                  { label: "Rayones", value: visit.checklist.exterior?.scratches },
                  { label: "Golpes/abolladuras", value: visit.checklist.exterior?.dents },
                  { label: "Luces", value: visit.checklist.exterior?.lights },
                ]} />
                <ChecklistSection label="Interior" items={[
                  { label: "Radio/audio", value: visit.checklist.interior?.radio },
                  { label: "Pantalla", value: visit.checklist.interior?.screen },
                  { label: "Alfombras", value: visit.checklist.interior?.mats },
                ]} />
                <ChecklistSection label="Mecánico" items={[
                  { label: "Nivel de aceite", value: visit.checklist.mechanical?.oil_level },
                  { label: "Coolant", value: visit.checklist.mechanical?.coolant },
                  { label: "Batería", value: visit.checklist.mechanical?.battery },
                ]} />
              </div>
            </div>
          )}

          {visit.signature_data && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                <PenLine className="h-3.5 w-3.5" />
                Firma del cliente
              </div>
              <div className="rounded-lg border border-border bg-white p-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visit.signature_data}
                  alt="Firma del cliente"
                  className="max-h-20 w-auto"
                />
              </div>
            </div>
          )}

          {wo && wo.items.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                <Wrench className="h-3.5 w-3.5" />
                Servicios / Piezas
              </div>
              <ul className="space-y-1.5">
                {wo.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground">{item.description}</span>
                    <span className="text-muted-foreground nums shrink-0 ml-3">
                      ×{item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {wo && wo.invoices.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                <FileText className="h-3.5 w-3.5" />
                Facturas
              </div>
              <ul className="space-y-2">
                {wo.invoices.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {inv.status === "PAGADA" ? (
                        <CheckCircle2 className={`h-4 w-4 ${INV_COLOR["PAGADA"]}`} />
                      ) : (
                        <AlertCircle className={`h-4 w-4 ${INV_COLOR[inv.status] ?? "text-muted-foreground"}`} />
                      )}
                      <Link
                        href={`/portal/${slug}/mis-facturas/${inv.id}`}
                        className="text-sm font-medium text-primary hover:underline nums"
                      >
                        {inv.invoice_number}
                      </Link>
                    </div>
                    <span className="nums text-sm font-semibold text-foreground">
                      {money(inv.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {wo && wo.items.length === 0 && wo.invoices.length === 0 && (
            <p className="text-xs text-muted-foreground">
              OT sin servicios registrados aún.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const PORTAL_SEVERITY_BADGE: Record<string, string> = {
  OK:    "bg-success/15 text-success",
  LEVE:  "bg-warning/15 text-warning",
  GRAVE: "bg-destructive/15 text-destructive",
  NA:    "bg-muted text-muted-foreground",
};
const PORTAL_SEVERITY_LABEL: Record<string, string> = {
  OK: "OK", LEVE: "Leve", GRAVE: "Grave", NA: "N/A",
};

function ChecklistSection({
  label,
  items,
}: {
  label: string;
  items: { label: string; value?: Severity }[];
}) {
  const relevant = items.filter((i) => i.value && i.value !== "NA");
  if (relevant.length === 0) return null;
  return (
    <div className="rounded-lg bg-muted/30 px-3 py-2 mb-1">
      <p className="text-xs font-semibold text-muted-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {relevant.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-xs">
            <span className={`rounded px-1.5 py-0.5 font-medium ${PORTAL_SEVERITY_BADGE[item.value!] ?? PORTAL_SEVERITY_BADGE.NA}`}>
              {PORTAL_SEVERITY_LABEL[item.value!] ?? item.value}
            </span>
            <span className="text-foreground">{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
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

  const allInvoices = history.visits.flatMap((v) => v.work_order?.invoices ?? []);

  return (
    <div className="space-y-8">
      {/* Vehicle header */}
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
          {history.license_plate} · {history.total_visits} visita
          {history.total_visits !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Recepciones y Órdenes de Trabajo */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Recepciones y Órdenes de Trabajo
        </h2>

        {history.visits.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <Clock className="mx-auto mb-2 h-7 w-7 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Sin visitas registradas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.visits.map((visit) => (
              <ReceptionCard key={visit.reception_id} visit={visit} slug={slug} />
            ))}
          </div>
        )}
      </section>

      {/* Facturas */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Facturas</h2>

        {allInvoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <FileText className="mx-auto mb-2 h-7 w-7 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Sin facturas.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {allInvoices.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/portal/${slug}/mis-facturas/${inv.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40 hover:bg-card/80"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      inv.status === "PAGADA"
                        ? "bg-success/10 text-success"
                        : inv.status === "ANULADA"
                        ? "bg-muted text-muted-foreground"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {inv.status === "PAGADA" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="nums font-semibold text-foreground">
                      {inv.invoice_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {inv.issue_date
                        ? new Date(inv.issue_date).toLocaleDateString("es-DO")
                        : "—"}
                    </p>
                  </div>
                  <span className="nums text-sm font-bold text-foreground">
                    {money(inv.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
