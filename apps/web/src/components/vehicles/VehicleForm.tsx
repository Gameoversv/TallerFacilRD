"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Vehicle } from "@/types/vehicle";

const TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "CVT"] as const;

const schema = z.object({
  brand: z.string().min(1, "Requerido").max(100),
  model: z.string().min(1, "Requerido").max(100),
  year: z.number().int().min(1900).max(2100),
  engine: z.string().optional(),
  vin: z.string().max(17).optional(),
  licensePlate: z.string().max(20).optional(),
  color: z.string().max(50).optional(),
  mileage: z.number().int().min(0).optional(),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "CVT"]).optional(),
  customerId: z.string().uuid("ID de cliente inválido"),
  turbo: z.boolean().optional(),
  suspension: z.string().optional(),
  tune: z.string().optional(),
  injectors: z.string().optional(),
  fuelType: z.string().optional(),
});

export type VehicleFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<VehicleFormValues>;
  onSubmit: (data: VehicleFormValues) => Promise<void>;
  submitLabel?: string;
  hideCustomer?: boolean;
}

export function VehicleForm({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar",
  hideCustomer = false,
}: Props) {
  const [tab, setTab] = useState<"basico" | "avanzado">("basico");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex gap-1 border-b mb-4">
        <button
          type="button"
          onClick={() => setTab("basico")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "basico"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Básico
        </button>
        <button
          type="button"
          onClick={() => setTab("avanzado")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "avanzado"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Avanzado
        </button>
      </div>

      {tab === "basico" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Marca *</Label>
              <Input {...register("brand")} placeholder="Toyota" />
              {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Modelo *</Label>
              <Input {...register("model")} placeholder="Corolla" />
              {errors.model && <p className="text-xs text-red-500">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Año *</Label>
              <Input {...register("year", { valueAsNumber: true })} type="number" placeholder="2020" />
              {errors.year && <p className="text-xs text-red-500">{errors.year.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Motor</Label>
              <Input {...register("engine")} placeholder="1.8L DOHC" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Placa</Label>
              <Input {...register("licensePlate")} placeholder="ABC-1234" />
            </div>
            <div className="space-y-1">
              <Label>VIN</Label>
              <Input {...register("vin")} placeholder="17 caracteres" maxLength={17} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Color</Label>
              <Input {...register("color")} placeholder="Blanco" />
            </div>
            <div className="space-y-1">
              <Label>Kilometraje</Label>
              <Input {...register("mileage", { valueAsNumber: true })} type="number" placeholder="0" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Transmisión</Label>
            <select
              {...register("transmission")}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">— Seleccionar —</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {t === "MANUAL" ? "Manual" : t === "AUTOMATIC" ? "Automático" : "CVT"}
                </option>
              ))}
            </select>
          </div>

          {!hideCustomer && (
            <div className="space-y-1">
              <Label>ID del cliente *</Label>
              <Input {...register("customerId")} placeholder="UUID del cliente" />
              {errors.customerId && (
                <p className="text-xs text-red-500">{errors.customerId.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "avanzado" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="turbo"
              {...register("turbo")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="turbo">Turbo</Label>
          </div>

          <div className="space-y-1">
            <Label>Suspensión</Label>
            <Input {...register("suspension")} placeholder="Coilovers, lowering springs..." />
          </div>

          <div className="space-y-1">
            <Label>Tune / ECU</Label>
            <Input {...register("tune")} placeholder="Stage 2, E-tune..." />
          </div>

          <div className="space-y-1">
            <Label>Inyectores</Label>
            <Input {...register("injectors")} placeholder="440cc, 550cc..." />
          </div>

          <div className="space-y-1">
            <Label>Combustible</Label>
            <Input {...register("fuelType")} placeholder="Gasolina, E85, Flex..." />
          </div>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}

export function vehicleToFormValues(v: Vehicle): VehicleFormValues {
  return {
    brand: v.brand,
    model: v.model,
    year: v.year,
    engine: v.engine ?? "",
    vin: v.vin ?? "",
    licensePlate: v.license_plate ?? "",
    color: v.color ?? "",
    mileage: v.mileage ?? undefined,

    transmission: v.transmission ?? undefined,
    customerId: v.customer_id,
    turbo: v.modifications?.turbo ?? undefined,
    suspension: v.modifications?.suspension ?? "",
    tune: v.modifications?.tune ?? "",
    injectors: v.modifications?.injectors ?? "",
    fuelType: v.modifications?.fuel_type ?? "",
  };
}
