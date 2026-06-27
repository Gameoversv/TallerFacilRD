"use client";

import { useState } from "react";
import {
  useReminders,
  useCompleteReminder,
  useDeleteReminder,
  type ReminderStatus,
  type Reminder,
} from "@/hooks/useReminders";
import { useVehicles } from "@/hooks/useVehicles";
import { ReminderForm } from "./_components/ReminderForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell, CheckCircle2, Plus, Trash2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  OIL_CHANGE: "Cambio de aceite",
  BRAKE_SERVICE: "Frenos",
  COOLANT_CHANGE: "Coolant",
  TIMING_BELT: "Correa distribución",
  ALIGNMENT_BALANCE: "Alineación/Balanceo",
  GENERAL_INSPECTION: "Inspección general",
  OTHER: "Otro",
};

const STATUS_CONFIG: Record<ReminderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  UPCOMING: { label: "Al día", variant: "secondary" },
  DUE_SOON: { label: "Próximo", variant: "default" },
  OVERDUE: { label: "Vencido", variant: "destructive" },
  COMPLETED: { label: "Completado", variant: "outline" },
};

function ReminderRow({ r }: { r: Reminder }) {
  const { mutate: complete, isPending: completing } = useCompleteReminder();
  const { mutate: remove, isPending: removing } = useDeleteReminder();
  const cfg = STATUS_CONFIG[r.status];

  return (
    <tr className="border-b transition-colors hover:bg-muted/30">
      <td className="px-4 py-3 text-sm font-medium">{r.license_plate ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{r.vehicle_label}</td>
      <td className="px-4 py-3 text-sm">{r.custom_label || TYPE_LABELS[r.type] || r.type}</td>
      <td className="px-4 py-3 text-sm">{r.next_date ?? "—"}</td>
      <td className="px-4 py-3 text-sm">{r.next_km ? r.next_km.toLocaleString() + " km" : "—"}</td>
      <td className="px-4 py-3">
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {r.status !== "COMPLETED" && (
            <Button
              size="sm"
              variant="ghost"
              disabled={completing}
              onClick={() => complete({ id: r.id })}
              title="Marcar como completado"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={removing}
            onClick={() => remove(r.id)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function RecordatoriosPage() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | "ALL">("ALL");
  const { data: reminders, isLoading } = useReminders();
  const { data: vehiclesPage } = useVehicles(null, "", 0);

  const vehicles = (vehiclesPage?.data ?? []).map((v) => ({
    id: v.id,
    label: `${v.license_plate ?? v.vin ?? "S/P"} — ${v.brand} ${v.model}`,
  }));

  const filtered = (reminders ?? []).filter(
    (r) => statusFilter === "ALL" || r.status === statusFilter
  );

  const overdue = (reminders ?? []).filter((r) => r.status === "OVERDUE").length;
  const dueSoon = (reminders ?? []).filter((r) => r.status === "DUE_SOON").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recordatorios</h1>
          <p className="text-sm text-muted-foreground">
            Mantenimientos programados por tiempo y kilometraje
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo recordatorio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear recordatorio</DialogTitle>
            </DialogHeader>
            <ReminderForm
              vehicles={vehicles}
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {(overdue > 0 || dueSoon > 0) && (
        <div className="flex gap-3">
          {overdue > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <Bell className="h-4 w-4" />
              <span><strong>{overdue}</strong> vencido{overdue > 1 ? "s" : ""}</span>
            </div>
          )}
          {dueSoon > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
              <Bell className="h-4 w-4" />
              <span><strong>{dueSoon}</strong> próximo{dueSoon > 1 ? "s" : ""} (próx. 14 días)</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {(["ALL", "OVERDUE", "DUE_SOON", "UPCOMING", "COMPLETED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s === "ALL" ? "Todos" : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Próxima fecha</th>
              <th className="px-4 py-3">Próximo km</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0
              ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No hay recordatorios
                    </td>
                  </tr>
                )
              : filtered.map((r) => <ReminderRow key={r.id} r={r} />)
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
