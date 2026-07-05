"use client";

import { useState } from "react";
import {
  useInventory,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useInventory";
import { ProductForm, productToFormValues, type ProductFormValues } from "@/components/inventory/ProductForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product, ProductCategory } from "@/types/product";

const CATEGORIES: ProductCategory[] = ["ACEITES", "FILTROS", "SENSORES", "BUJIAS", "SUSPENSION", "FRENOS"];

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ACEITES: "Aceites",
  FILTROS: "Filtros",
  SENSORES: "Sensores",
  BUJIAS: "Bujías",
  SUSPENSION: "Suspensión",
  FRENOS: "Frenos",
};

export default function InventarioPage() {
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useInventory(category, lowStock, page);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(editing?.id ?? "");
  const deleteMutation = useDeleteProduct();

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  function extractError(err: unknown): string {
    const e = err as { response?: { data?: { error?: string } }; message?: string };
    return e?.response?.data?.error ?? e?.message ?? "Error inesperado";
  }

  async function handleCreate(values: ProductFormValues) {
    setFormError(null);
    try {
      await createMutation.mutateAsync(values);
      setShowCreate(false);
    } catch (err) {
      setFormError(extractError(err));
    }
  }

  async function handleUpdate(values: ProductFormValues) {
    setFormError(null);
    try {
      await updateMutation.mutateAsync(values);
      setEditing(null);
    } catch (err) {
      setFormError(extractError(err));
    }
  }

  const columns: ResponsiveColumn<(typeof products)[number]>[] = [
    {
      header: "Código",
      primary: true,
      cell: (p) => <span className="font-mono text-sm">{p.internal_code}</span>,
    },
    { header: "Descripción", cell: (p) => p.description },
    {
      header: "Categoría",
      cell: (p) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {CATEGORY_LABELS[p.category]}
        </span>
      ),
    },
    {
      header: "Stock",
      className: "text-right",
      cell: (p) => (
        <>
          <span className={`font-medium ${p.low_stock ? "text-destructive" : ""}`}>
            {p.current_stock}
          </span>
          {p.low_stock && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-medium">
              Stock Bajo
            </span>
          )}
          <span className="text-muted-foreground text-xs ml-1">/ mín {p.min_stock}</span>
        </>
      ),
    },
    {
      header: "Precio venta",
      className: "text-right",
      cell: (p) => (
        <span className="font-medium">
          RD$ {p.sale_price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "",
      isAction: true,
      className: "w-32",
      cell: (p) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(p);
            }}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`¿Eliminar "${p.description}"?`)) {
                deleteMutation.mutate(p.id);
              }
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventario"
        description={`${total} productos`}
        actions={
          <Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
            + Nuevo producto
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <select
          value={category ?? ""}
          onChange={(e) => {
            setCategory((e.target.value as ProductCategory) || null);
            setPage(0);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => { setLowStock(e.target.checked); setPage(0); }}
            className="h-4 w-4 rounded border-border"
          />
          Solo stock bajo
        </label>
      </div>

      <ResponsiveList
        items={products}
        columns={columns}
        getKey={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="Sin productos"
      />

      {totalPages > 1 && (
        <div className="flex gap-2 items-center justify-end text-sm">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Anterior
          </Button>
          <span className="text-muted-foreground">Página {page + 1} de {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Siguiente →
          </Button>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setFormError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleCreate} error={formError} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) { setEditing(null); setFormError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProductForm
              defaultValues={productToFormValues(editing)}
              onSubmit={handleUpdate}
              submitLabel="Actualizar"
              error={formError}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
