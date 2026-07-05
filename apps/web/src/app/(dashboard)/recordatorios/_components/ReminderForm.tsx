/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState } from "react";
import { useCreateReminder, type CreateReminderPayload, type ReminderType } from "@/hooks/useReminders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  OIL_CHANGE: "Cambio de aceite",
  BRAKE_SERVICE: "Servicio de frenos",
  COOLANT_CHANGE: "Cambio de coolant",
  TIMING_BELT: "Correa de distribución",
  ALIGNMENT_BALANCE: "Alineación y balanceo",
  GENERAL_INSPECTION: "Inspección general",
  OTHER: "Otro",
};

interface Props {
  vehicles: { id: string; label: string }[];
  onSuccess: () => void;
}

export function ReminderForm({ vehicles, onSuccess }: Props) {
  const { mutate, isPending } = useCreateReminder();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [type, setType] = useState<ReminderType>("OIL_CHANGE");
  const [customLabel, setCustomLabel] = useState("");
  const [lastServiceAt, setLastServiceAt] = useState("");
  const [lastServiceKm, setLastServiceKm] = useState("");
  const [intervalDays, setIntervalDays] = useState("");
  const [intervalKm, setIntervalKm] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateReminderPayload = {
      vehicle_id: vehicleId,
      type,
      custom_label: customLabel || undefined,
      last_service_at: lastServiceAt || undefined,
      last_service_km: lastServiceKm ? Number(lastServiceKm) : undefined,
      interval_days: intervalDays ? Number(intervalDays) : undefined,
      interval_km: intervalKm ? Number(intervalKm) : undefined,
      notes: notes || undefined,
    };
    mutate(payload, { onSuccess });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Vehículo</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            required
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label>Tipo de recordatorio</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as ReminderType)}
          >
            {Object.entries(REMINDER_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {type === "OTHER" && (
        <div className="space-y-1">
          <Label>Descripción personalizada</Label>
          <Input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Ej: Revisión de transmisión" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Fecha último servicio</Label>
          <Input type="date" value={lastServiceAt} onChange={(e) => setLastServiceAt(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Km en último servicio</Label>
          <Input type="number" value={lastServiceKm} onChange={(e) => setLastServiceKm(e.target.value)} placeholder="Ej: 45000" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Intervalo (días)</Label>
          <Input type="number" value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} placeholder="Ej: 90" />
        </div>
        <div className="space-y-1">
          <Label>Intervalo (km)</Label>
          <Input type="number" value={intervalKm} onChange={(e) => setIntervalKm(e.target.value)} placeholder="Ej: 5000" />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Notas</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
      </div>

      <Button type="submit" className="w-full" disabled={isPending || !vehicleId}>
        {isPending ? "Guardando..." : "Crear recordatorio"}
      </Button>
    </form>
  );
}
