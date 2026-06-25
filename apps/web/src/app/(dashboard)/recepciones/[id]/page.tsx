"use client";

import { use } from "react";
import { useReception } from "@/hooks/useReceptions";
import type { ReceptionChecklist } from "@/types/reception";

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

function ChecklistDisplay({ checklist }: { checklist: ReceptionChecklist }) {
  const items: { section: string; label: string; value?: boolean }[] = [
    { section: "Exterior", label: "Rayones", value: checklist.exterior?.scratches },
    { section: "Exterior", label: "Golpes", value: checklist.exterior?.dents },
    { section: "Exterior", label: "Luces", value: checklist.exterior?.lights },
    { section: "Interior", label: "Radio", value: checklist.interior?.radio },
    { section: "Interior", label: "Pantalla", value: checklist.interior?.screen },
    { section: "Interior", label: "Alfombras", value: checklist.interior?.mats },
    { section: "Mecánico", label: "Nivel aceite", value: checklist.mechanical?.oil_level },
    { section: "Mecánico", label: "Coolant", value: checklist.mechanical?.coolant },
    { section: "Mecánico", label: "Batería", value: checklist.mechanical?.battery },
  ];

  const sections = [...new Set(items.map((i) => i.section))];

  return (
    <div className="grid grid-cols-3 gap-4">
      {sections.map((section) => (
        <div key={section}>
          <h3 className="text-xs font-medium text-muted-foreground mb-2">{section}</h3>
          <ul className="space-y-1">
            {items
              .filter((i) => i.section === section)
              .map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                      item.value ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.value ? "✓" : "–"}
                  </span>
                  {item.label}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
