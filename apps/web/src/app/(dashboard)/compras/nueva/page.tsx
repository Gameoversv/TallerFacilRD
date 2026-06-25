"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSuppliers, useCreateSupplier, useCreatePurchase } from "@/hooks/usePurchases";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PurchaseItemInput } from "@/types/purchase";

interface LineItem extends PurchaseItemInput {
  productCode: string;
  productDescription: string;
  subtotal: number;
}

export default function NuevaCompraPage() {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const { data: suppliersData } = useSuppliers();
  const { data: productsData } = useInventory(null, false, 0, 200);
  const createSupplier = useCreateSupplier();
  const createPurchase = useCreatePurchase();

  const suppliers = suppliersData?.data ?? [];
  const allProducts = productsData?.data ?? [];
  const filteredProducts = productSearch.length >= 1
    ? allProducts.filter((p) =>
        p.internal_code.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(productSearch.toLowerCase())
      )
    : [];

  function addItem(productId: string, code: string, description: string) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) return prev;
      return [...prev, { productId, productCode: code, productDescription: description, quantity: 1, unitCost: 0, subtotal: 0 }];
    });
    setProductSearch("");
  }

  function updateItem(idx: number, field: "quantity" | "unitCost", value: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        updated.subtotal = updated.quantity * updated.unitCost;
        return updated;
      })
    );
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  async function handleCreateSupplier() {
    if (!newSupplierName.trim()) return;
    try {
      const res = await createSupplier.mutateAsync({
        name: newSupplierName.trim(),
        phone: newSupplierPhone || undefined,
        email: newSupplierEmail || undefined,
      });
      setSupplierId(res.data.id);
      setShowSupplierForm(false);
      setNewSupplierName("");
      setNewSupplierPhone("");
      setNewSupplierEmail("");
    } catch {
      /* noop — supplier creation failed, keep form open */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supplierId) { setError("Selecciona un proveedor"); return; }
    if (items.length === 0) { setError("Agrega al menos un producto"); return; }
    if (items.some((i) => i.unitCost <= 0)) { setError("Todos los costos deben ser mayores a 0"); return; }

    try {
      const res = await createPurchase.mutateAsync({
        supplierId,
        purchaseDate,
        notes: notes.trim() || undefined,
        items: items.map(({ productId, quantity, unitCost }) => ({ productId, quantity, unitCost })),
      });
      router.push(`/compras/${res.data.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e?.response?.data?.error ?? e?.message ?? "Error al registrar compra");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-white">Nueva compra</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Proveedor */}
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-foreground">Proveedor</h2>
          <div className="flex gap-2">
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">— Seleccionar proveedor —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <Button type="button" variant="outline" onClick={() => setShowSupplierForm(true)}>
              + Nuevo
            </Button>
          </div>
          <div className="space-y-1">
            <Label>Fecha de compra *</Label>
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Notas</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones opcionales..." />
          </div>
        </div>

        {/* Productos */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Productos</h2>
          <div className="relative">
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Buscar por código o descripción..."
            />
            {filteredProducts.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 border rounded-md bg-card shadow-lg max-h-48 overflow-auto text-sm">
                {filteredProducts.map((p) => (
                  <li
                    key={p.id}
                    onClick={() => addItem(p.id, p.internal_code, p.description)}
                    className="px-3 py-2 hover:bg-muted/40 cursor-pointer"
                  >
                    <span className="font-mono text-muted-foreground">{p.internal_code}</span>
                    {" — "}{p.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Producto</th>
                  <th className="pb-2 w-24 text-center">Cantidad</th>
                  <th className="pb-2 w-32 text-right">Costo unit.</th>
                  <th className="pb-2 w-32 text-right">Subtotal</th>
                  <th className="pb-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, idx) => (
                  <tr key={item.productId}>
                    <td className="py-2">
                      <p className="font-medium">{item.productDescription}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.productCode}</p>
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                        className="w-full text-center border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost || ""}
                        onChange={(e) => updateItem(idx, "unitCost", parseFloat(e.target.value) || 0)}
                        className="w-full text-right border rounded px-2 py-1"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 text-right font-medium">
                      RD$ {item.subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 text-center">
                      <button type="button" onClick={() => removeItem(idx)} className="text-destructive hover:text-destructive text-lg leading-none">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-bold">
                  <td colSpan={3} className="pt-2 text-right">Total</td>
                  <td className="pt-2 text-right">
                    RD$ {total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={createPurchase.isPending}>
            {createPurchase.isPending ? "Registrando..." : "Registrar compra"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/compras")}>
            Cancelar
          </Button>
        </div>
      </form>

      {/* Nuevo proveedor dialog */}
      <Dialog open={showSupplierForm} onOpenChange={setShowSupplierForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo proveedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nombre *</Label>
              <Input value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} placeholder="Distribuidora XYZ" />
            </div>
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input value={newSupplierPhone} onChange={(e) => setNewSupplierPhone(e.target.value)} placeholder="809-000-0000" />
            </div>
            <div className="space-y-1">
              <Label>Correo</Label>
              <Input value={newSupplierEmail} onChange={(e) => setNewSupplierEmail(e.target.value)} type="email" placeholder="proveedor@mail.com" />
            </div>
            <Button onClick={handleCreateSupplier} disabled={createSupplier.isPending} className="w-full">
              {createSupplier.isPending ? "Guardando..." : "Crear proveedor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
