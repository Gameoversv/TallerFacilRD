"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { useVehicleHistory } from "@/hooks/useVehicleHistory";
import { VehicleForm, vehicleToFormValues, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "recepciones" | "ordenes" | "historial">("info");

  const { data, isLoading, isError } = useVehicle(id);
  const updateMutation = useUpdateVehicle(id);
  const deleteMutation = useDeleteVehicle();

  if (isLoading) return <p className="text-sm text-gray-400">Cargando...</p>;
  if (isError || !data?.data) return <p className="text-sm text-red-500">Vehículo no encontrado.</p>;

  const v = data.data;

  async function handleUpdate(values: VehicleFormValues) {
    await updateMutation.mutateAsync({
      brand: values.brand,
      model: values.model,
      year: values.year,
      engine: values.engine || undefined,
      vin: values.vin || undefined,
      licensePlate: values.licensePlate || undefined,
      color: values.color || undefined,
      mileage: typeof values.mileage === "number" ? values.mileage : undefined,
      transmission: values.transmission,
      modifications:
        values.turbo || values.suspension || values.tune || values.injectors || values.fuelType
          ? {
              turbo: values.turbo,
              suspension: values.suspension || undefined,
              tune: values.tune || undefined,
              injectors: values.injectors || undefined,
              fuelType: values.fuelType || undefined,
            }
          : undefined,
    });
    setShowEdit(false);
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar ${v.brand} ${v.model}? Esta acción no se puede deshacer.`)) return;
    await deleteMutation.mutateAsync(v.id);
    router.push("/vehiculos");
  }

  const tabs = [
    { key: "info", label: "Info" },
    { key: "recepciones", label: "Recepciones" },
    { key: "ordenes", label: "Órdenes" },
    { key: "historial", label: "Historial" },
  ] as const;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/vehiculos")}
            className="text-sm text-gray-400 hover:text-gray-600 mb-1 block"
          >
            ← Vehículos
          </button>
          <h1 className="text-2xl font-bold">
            {v.brand} {v.model} <span className="text-gray-400 font-normal">{v.year}</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEdit(true)}>
            Editar
          </Button>
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-700"
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos del vehículo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Motor" value={v.engine} />
              <Detail label="Transmisión" value={v.transmission} />
              <Detail label="Placa" value={v.license_plate} />
              <Detail label="VIN" value={v.vin} />
              <Detail label="Color" value={v.color} />
              <Detail label="Kilometraje" value={v.mileage != null ? `${v.mileage.toLocaleString()} km` : null} />
            </CardContent>
          </Card>

          {v.modifications && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Modificaciones</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Turbo" value={v.modifications.turbo === true ? "Sí" : v.modifications.turbo === false ? "No" : null} />
                <Detail label="Suspensión" value={v.modifications.suspension} />
                <Detail label="Tune / ECU" value={v.modifications.tune} />
                <Detail label="Inyectores" value={v.modifications.injectors} />
                <Detail label="Combustible" value={v.modifications.fuel_type} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Propietario</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <button
                onClick={() => router.push(`/clientes/${v.customer_id}`)}
                className="font-medium text-blue-600 hover:underline"
              >
                {v.customer_name}
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "recepciones" && (
        <Card>
          <CardContent className="text-sm text-gray-400 text-center py-6">
            Recepciones disponibles en MOD-04.
          </CardContent>
        </Card>
      )}

      {activeTab === "ordenes" && (
        <Card>
          <CardContent className="text-sm text-gray-400 text-center py-6">
            Órdenes de trabajo disponibles en MOD-06.
          </CardContent>
        </Card>
      )}

      {activeTab === "historial" && (
        <VehicleHistoryTab vehicleId={id} />
      )}

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar vehículo</DialogTitle>
          </DialogHeader>
          <VehicleForm
            defaultValues={vehicleToFormValues(v)}
            onSubmit={handleUpdate}
            submitLabel="Actualizar"
            hideCustomer
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-800">{value ?? "—"}</p>
    </div>
  );
}

const WO_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente", IN_PROGRESS: "En progreso",
  WAITING_PARTS: "Esperando piezas", COMPLETED: "Completada", CANCELLED: "Cancelada",
};
const WO_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600", IN_PROGRESS: "bg-blue-100 text-blue-700",
  WAITING_PARTS: "bg-yellow-100 text-yellow-700", COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};
const INV_STATUS_COLOR: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  PAGADA: "bg-green-100 text-green-700",
  ANULADA: "bg-gray-100 text-gray-500",
};

function VehicleHistoryTab({ vehicleId }: { vehicleId: string }) {
  const { data, isLoading } = useVehicleHistory(vehicleId);
  const history = data?.data;

  if (isLoading) return <p className="text-sm text-gray-400">Cargando historial...</p>;
  if (!history) return <p className="text-sm text-red-500">Error al cargar historial</p>;
  if (history.visits.length === 0) {
    return (
      <Card>
        <CardContent className="text-sm text-gray-400 text-center py-6">
          Sin visitas registradas
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-5">
        {history.visits.map((visit, idx) => (
          <div key={visit.reception_id} className="relative pl-14">
            <div className="absolute left-3.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-gray-400 ring-2 ring-white" />
            <div className="rounded-lg border bg-white p-4 space-y-3 shadow-sm text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Visita #{history.total_visits - idx}</p>
                  <p className="font-semibold mt-0.5">
                    {visit.reception_date
                      ? new Date(visit.reception_date).toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" })
                      : "Fecha no disponible"}
                  </p>
                  <p className="text-gray-600 mt-0.5">{visit.complaint || "Sin motivo especificado"}</p>
                </div>
                <Link href={`/recepciones/${visit.reception_id}`}>
                  <Button variant="ghost" size="sm">Recepción</Button>
                </Link>
              </div>

              {visit.work_order && (
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WO_STATUS_COLOR[visit.work_order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      OT: {WO_STATUS_LABEL[visit.work_order.status] ?? visit.work_order.status}
                    </span>
                    <Link href={`/ordenes/${visit.work_order.id}`}>
                      <Button variant="ghost" size="sm">Ver OT</Button>
                    </Link>
                  </div>

                  {visit.work_order.items.length > 0 && (
                    <div className="rounded bg-gray-50 p-2 space-y-1">
                      {visit.work_order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-700">{item.description}</span>
                          <span className="text-gray-500">{item.quantity}x RD$ {item.unit_price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {visit.work_order.invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between border rounded px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-xs">{inv.invoice_number}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${INV_STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-500"}`}>{inv.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">RD$ {inv.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                        <Link href={`/facturas/${inv.id}`}><Button variant="ghost" size="sm">Ver</Button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
