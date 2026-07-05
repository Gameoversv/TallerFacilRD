"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicles, useCreateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { VehicleForm, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function VehiculosPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useVehicles(null, q, page);
  const createMutation = useCreateVehicle();
  const deleteMutation = useDeleteVehicle();

  const vehicles = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  async function handleCreate(values: VehicleFormValues) {
    await createMutation.mutateAsync({
      brand: values.brand,
      model: values.model,
      year: values.year,
      engine: values.engine || undefined,
      vin: values.vin || undefined,
      license_plate: values.licensePlate || undefined,
      color: values.color || undefined,
      mileage: Number.isFinite(values.mileage) ? values.mileage : undefined,
      transmission: values.transmission || undefined,
      customer_id: values.customerId,
      modifications:
        values.turbo || values.suspension || values.tune || values.injectors || values.fuelType
          ? {
              turbo: values.turbo,
              suspension: values.suspension || undefined,
              tune: values.tune || undefined,
              injectors: values.injectors || undefined,
              fuel_type: values.fuelType || undefined,
            }
          : undefined,
    });
    setShowCreate(false);
  }

  const columns: ResponsiveColumn<(typeof vehicles)[number]>[] = [
    {
      header: "Vehículo",
      primary: true,
      cell: (v) => (
        <span className="font-medium">
          {v.brand} {v.model}
        </span>
      ),
    },
    { header: "Año", cell: (v) => v.year },
    { header: "Placa", cell: (v) => v.license_plate ?? "—" },
    { header: "Propietario", cell: (v) => v.customer_name },
    { header: "Transmisión", cell: (v) => v.transmission ?? "—" },
    {
      header: "",
      isAction: true,
      className: "w-24",
      cell: (v) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar ${v.brand} ${v.model}?`)) {
              deleteMutation.mutate(v.id);
            }
          }}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vehículos"
        description={`${total} registros`}
        actions={
          <Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
            + Nuevo vehículo
          </Button>
        }
      />

      <Input
        placeholder="Buscar por placa, VIN o propietario..."
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(0);
        }}
        className="max-w-sm"
      />

      <ResponsiveList
        items={vehicles}
        columns={columns}
        getKey={(v) => v.id}
        onRowClick={(v) => router.push(`/vehiculos/${v.id}`)}
        isLoading={isLoading}
        emptyMessage="Sin resultados"
      />

      {totalPages > 1 && (
        <div className="flex gap-2 items-center justify-end text-sm">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
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

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo vehículo</DialogTitle>
          </DialogHeader>
          <VehicleForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
