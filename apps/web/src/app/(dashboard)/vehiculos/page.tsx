"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicles, useCreateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { VehicleForm, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Vehículos</h1>
          <p className="text-sm text-muted-foreground">{total} registros</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Nuevo vehículo</Button>
      </div>

      <Input
        placeholder="Buscar por placa, VIN o propietario..."
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(0);
        }}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehículo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Transmisión</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Sin resultados
                  </TableCell>
                </TableRow>
              )}
              {vehicles.map((v) => (
                <TableRow
                  key={v.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => router.push(`/vehiculos/${v.id}`)}
                >
                  <TableCell className="font-medium">
                    {v.brand} {v.model}
                  </TableCell>
                  <TableCell>{v.year}</TableCell>
                  <TableCell>{v.license_plate ?? "—"}</TableCell>
                  <TableCell>{v.customer_name}</TableCell>
                  <TableCell>{v.transmission ?? "—"}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
