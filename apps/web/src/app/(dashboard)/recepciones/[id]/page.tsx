"use client";

import { use } from "react";
import { useReception } from "@/hooks/useReceptions";
import type { ReceptionChecklist, ChecklistSeverity } from "@/types/reception";

export default function RecepcionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useReception(id);
  const reception = data?.data;

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Cargando...</div>;
  if (!reception) return <div className="p-6 text-sm text-destructive">Recepción no encontrada.</div>;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Recepción</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(reception.created_at).toLocaleString("es-DO")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="Cliente" value={reception.customer_name} />
        <InfoCard label="Vehículo" value={reception.vehicle_label} />
        <InfoCard label="Km entrada" value={String(reception.entry_km)} />
      </div>

      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Problema reportado
        </h2>
        <p className="text-sm">{reception.reported_problem}</p>
      </div>

      {reception.notes && (
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notas</h2>
          <p className="text-sm">{reception.notes}</p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Checklist</h2>
        <ChecklistDisplay checklist={reception.checklist} />
      </div>

      {reception.photos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Fotos ({reception.photos.length})
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {reception.photos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-32 object-cover rounded-md hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {reception.signature_data ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Firma del cliente
          </h2>
          <div className="rounded-xl border border-border bg-white p-4 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reception.signature_data}
              alt="Firma del cliente"
              className="max-h-28 w-auto"
            />
          </div>
          {reception.signed_at && (
            <p className="text-xs text-muted-foreground">
              Firmado el {new Date(reception.signed_at).toLocaleString("es-DO")}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">Sin firma capturada.</p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-lg p-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}

const SEVERITY_BADGE: Record<string, string> = {
  OK:    "bg-success/15 text-success border-success/30",
  LEVE:  "bg-warning/15 text-warning border-warning/30",
  GRAVE: "bg-destructive/15 text-destructive border-destructive/30",
  NA:    "bg-muted text-muted-foreground border-border",
};

const SEVERITY_LABEL: Record<string, string> = {
  OK: "OK", LEVE: "Leve", GRAVE: "Grave", NA: "N/A",
};

function SeverityBadge({ value }: { value?: ChecklistSeverity }) {
  const v = value ?? "NA";
  return (
    <span className={`rounded border px-1.5 py-0.5 text-xs font-medium ${SEVERITY_BADGE[v] ?? SEVERITY_BADGE.NA}`}>
      {SEVERITY_LABEL[v] ?? v}
    </span>
  );
}

function ChecklistDisplay({ checklist }: { checklist: ReceptionChecklist }) {
  const sections = [
    {
      label: "Exterior",
      items: [
        { label: "Rayones", value: checklist.exterior?.scratches },
        { label: "Golpes", value: checklist.exterior?.dents },
        { label: "Luces", value: checklist.exterior?.lights },
      ],
    },
    {
      label: "Interior",
      items: [
        { label: "Radio", value: checklist.interior?.radio },
        { label: "Pantalla", value: checklist.interior?.screen },
        { label: "Alfombras", value: checklist.interior?.mats },
      ],
    },
    {
      label: "Mecánico",
      items: [
        { label: "Nivel aceite", value: checklist.mechanical?.oil_level },
        { label: "Coolant", value: checklist.mechanical?.coolant },
        { label: "Batería", value: checklist.mechanical?.battery },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {sections.map((section) => (
        <div key={section.label}>
          <h3 className="text-xs font-medium text-muted-foreground mb-2">{section.label}</h3>
          <ul className="space-y-1.5">
            {section.items.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
                <span>{item.label}</span>
                <SeverityBadge value={item.value} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
