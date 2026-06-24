"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product } from "@/types/product";

const CATEGORIES = ["ACEITES", "FILTROS", "SENSORES", "BUJIAS", "SUSPENSION", "FRENOS"] as const;

const schema = z.object({
  internalCode: z.string().min(1, "Requerido").max(50),
  description: z.string().min(1, "Requerido"),
  purchaseCost: z.number().min(0, "Debe ser ≥ 0"),
  salePrice: z.number().min(0, "Debe ser ≥ 0"),
  currentStock: z.number().int().min(0, "Debe ser ≥ 0"),
  minStock: z.number().int().min(0, "Debe ser ≥ 0"),
  category: z.enum(CATEGORIES),
});

export type ProductFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  submitLabel?: string;
  error?: string | null;
}

export function ProductForm({ defaultValues, onSubmit, submitLabel = "Guardar", error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Código interno *</Label>
          <Input {...register("internalCode")} placeholder="ACE-001" />
          {errors.internalCode && <p className="text-xs text-red-500">{errors.internalCode.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Categoría *</Label>
          <select
            {...register("category")}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">— Seleccionar —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label>Descripción *</Label>
        <Input {...register("description")} placeholder="Aceite de motor 5W-30 sintético" />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Costo de compra (RD$) *</Label>
          <Input {...register("purchaseCost", { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0.00" />
          {errors.purchaseCost && <p className="text-xs text-red-500">{errors.purchaseCost.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Precio de venta (RD$) *</Label>
          <Input {...register("salePrice", { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0.00" />
          {errors.salePrice && <p className="text-xs text-red-500">{errors.salePrice.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Stock actual *</Label>
          <Input {...register("currentStock", { valueAsNumber: true })} type="number" min="0" placeholder="0" />
          {errors.currentStock && <p className="text-xs text-red-500">{errors.currentStock.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Stock mínimo (alerta) *</Label>
          <Input {...register("minStock", { valueAsNumber: true })} type="number" min="0" placeholder="5" />
          {errors.minStock && <p className="text-xs text-red-500">{errors.minStock.message}</p>}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}

export function productToFormValues(p: Product): ProductFormValues {
  return {
    internalCode: p.internal_code,
    description: p.description,
    purchaseCost: p.purchase_cost,
    salePrice: p.sale_price,
    currentStock: p.current_stock,
    minStock: p.min_stock,
    category: p.category,
  };
}
