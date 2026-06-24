"use client";

import { useState } from "react";
import {
  useInventory,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useInventory";
import { ProductForm, productToFormValues, type ProductFormValues } from "@/components/inventory/ProductForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-sm text-gray-500">{total} productos</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Nuevo producto</Button>
      </div>

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
            className="h-4 w-4 rounded border-gray-300"
          />
          Solo stock bajo
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Precio venta</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    Sin productos
                  </TableCell>
                </TableRow>
              )}
              {products.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">{p.internal_code}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {CATEGORY_LABELS[p.category]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${p.low_stock ? "text-red-600" : ""}`}>
                      {p.current_stock}
                    </span>
                    {p.low_stock && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                        Stock Bajo
                      </span>
                    )}
                    <span className="text-gray-400 text-xs ml-1">/ mín {p.min_stock}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    RD$ {p.sale_price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(p)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm(`¿Eliminar "${p.description}"?`)) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 items-center justify-end text-sm">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Anterior
          </Button>
          <span className="text-gray-500">Página {page + 1} de {totalPages}</span>
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
