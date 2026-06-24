"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicles } from "@/hooks/useVehicles";
import { useVehicleReceptions } from "@/hooks/useReceptions";
import { useCreateWorkOrder } from "@/hooks/useWorkOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NuevaOrdenPage() {
  const router = useRouter();
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedReceptionId, setSelectedReceptionId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: vehiclesData } = useVehicles(null, vehicleSearch, 0);
  const { data: receptionsData } = useVehicleReceptions(selectedVehicleId ?? "");

  const createMutation = useCreateWorkOrder();

  const vehicles = vehiclesData?.data ?? [];
  const receptions = receptionsData?.data ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReceptionId) return;
    setError(null);

    try {
      const result = await createMutation.mutateAsync({
        receptionId: selectedReceptionId,
        diagnosis: diagnosis.trim() || undefined,
        assignedTo: assignedTo.trim() || undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      });
      router.push(`/ordenes/${result.data.id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al crear la orden de trabajo";
      setError(msg);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva orden de trabajo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Selecciona el vehículo y la recepción asociada
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-lg border bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">1. Seleccionar vehículo</h2>
          <Input
            placeholder="Buscar por placa, marca o propietario..."
            value={vehicleSearch}
            onChange={(e) => {
              setVehicleSearch(e.target.value);
              setSelectedVehicleId(null);
              setSelectedReceptionId(null);
            }}
          />
          {vehicleSearch.length >= 1 && vehicles.length > 0 && !selectedVehicleId && (
            <ul className="border rounded-md divide-y text-sm max-h-48 overflow-auto">
              {vehicles.map((v) => (
                <li
                  key={v.id}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                    setVehicleSearch(`${v.brand} ${v.model} ${v.year} (${v.license_plate ?? "Sin placa"})`);
                    setSelectedReceptionId(null);
                  }}
                >
                  <span className="font-medium">
                    {v.brand} {v.model} {v.year}
                  </span>{" "}
                  <span className="text-gray-500">
                    — {v.license_plate ?? "Sin placa"} · {v.customer_name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {selectedVehicleId && (
          <section className="rounded-lg border bg-white p-5 space-y-4">
            <h2 className="font-semibold text-gray-700">2. Seleccionar recepción</h2>
            {receptions.length === 0 ? (
              <p className="text-sm text-gray-400">
                No hay recepciones para este vehículo.
              </p>
            ) : (
              <ul className="divide-y border rounded-md text-sm max-h-56 overflow-auto">
                {receptions.map((r) => (
                  <li
                    key={r.id}
                    onClick={() => setSelectedReceptionId(r.id)}
                    className={`px-3 py-3 cursor-pointer transition-colors ${
                      selectedReceptionId === r.id
                        ? "bg-blue-50 border-l-2 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-medium truncate">{r.reported_problem}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(r.created_at).toLocaleDateString("es-DO")} ·{" "}
                      {r.entry_km.toLocaleString()} km
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {selectedReceptionId && (
          <section className="rounded-lg border bg-white p-5 space-y-4">
            <h2 className="font-semibold text-gray-700">3. Detalles de la orden</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Diagnóstico inicial
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Descripción del problema encontrado..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Técnico asignado
                  </label>
                  <Input
                    placeholder="Nombre del mecánico"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Costo estimado (RD$)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!selectedReceptionId || createMutation.isPending}
          >
            {createMutation.isPending ? "Creando..." : "Crear orden"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/ordenes")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
