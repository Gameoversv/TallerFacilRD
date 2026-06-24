"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { VehicleForm, vehicleToFormValues, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
        <Card>
          <CardContent className="text-sm text-gray-400 text-center py-6">
            Historial completo disponible en MOD-15.
          </CardContent>
        </Card>
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
