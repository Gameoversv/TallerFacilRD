"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateInvoice } from "@/hooks/useInvoices";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvoiceItemInput, InvoiceItemType } from "@/types/invoice";
import type { WorkOrder } from "@/types/work-order";

export default function NuevaFacturaPage() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();

  const [woSearch, setWoSearch] = useState("");
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(null);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [applyItbis, setApplyItbis] = useState(false);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItemInput[]>([
    { itemType: "MANO_OBRA", description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);

  // Load all work orders (no status filter so all appear)
  const { data: woData } = useWorkOrders(null, 0);
  const allWos = woData?.data ?? [];
  const filteredWos = woSearch.length >= 1
    ? allWos.filter((wo) =>
        wo.vehicle_label.toLowerCase().includes(woSearch.toLowerCase()) ||
        wo.customer_name.toLowerCase().includes(woSearch.toLowerCase())
      )
    : [];

  function selectWo(wo: WorkOrder) {
    setSelectedWo(wo);
    setWoSearch("");
  }

  function addItem() {
    setItems((prev) => [...prev, { itemType: "MANO_OBRA", description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem<K extends keyof InvoiceItemInput>(idx: number, field: K, value: InvoiceItemInput[K]) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const itbisAmount = applyItbis ? subtotal * 0.18 : 0;
  const total = subtotal + itbisAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedWo) { setError("Selecciona una orden de trabajo"); return; }
    if (items.some((i) => !i.description.trim())) { setError("Todos los ítems deben tener descripción"); return; }
    if (items.some((i) => i.unitPrice <= 0)) { setError("Todos los precios deben ser mayores a 0"); return; }

    try {
      const res = await createInvoice.mutateAsync({
        workOrderId: selectedWo.id,
        issueDate,
        applyItbis,
        notes: notes.trim() || undefined,
        items,
      });
      router.push(`/facturas/${res.data.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e?.response?.data?.error ?? e?.message ?? "Error al crear factura");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Nueva factura</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Orden de trabajo */}
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Orden de trabajo</h2>

          {selectedWo ? (
            <div className="flex items-center justify-between rounded-md border bg-gray-50 px-4 py-3">
              <div>
                <p className="font-medium text-sm">{selectedWo.vehicle_label}</p>
                <p className="text-xs text-gray-500">{selectedWo.customer_name} · {selectedWo.status}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWo(null)}
                className="text-xs text-gray-400 hover:text-gray-700 underline"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="relative">
              <Input
                value={woSearch}
                onChange={(e) => setWoSearch(e.target.value)}
                placeholder="Buscar por vehículo o cliente..."
                autoComplete="off"
              />
              {filteredWos.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-52 overflow-auto text-sm">
                  {filteredWos.map((wo) => (
                    <li
                      key={wo.id}
                      onClick={() => selectWo(wo)}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="font-medium">{wo.vehicle_label}</p>
                      <p className="text-xs text-gray-500">{wo.customer_name} · <span className="capitalize">{wo.status.toLowerCase().replace("_", " ")}</span></p>
                    </li>
                  ))}
                </ul>
              )}
              {woSearch.length >= 1 && filteredWos.length === 0 && (
                <p className="mt-1 text-xs text-gray-400">Sin resultados</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label>Fecha de emisión *</Label>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Notas</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." />
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Ítems</h2>

          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[120px_1fr_70px_130px_32px] gap-2 items-end">
              <div>
                {idx === 0 && <Label className="text-xs">Tipo</Label>}
                <select
                  value={item.itemType}
                  onChange={(e) => updateItem(idx, "itemType", e.target.value as InvoiceItemType)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm"
                >
                  <option value="MANO_OBRA">Mano de obra</option>
                  <option value="PIEZA">Pieza</option>
                </select>
              </div>
              <div>
                {idx === 0 && <Label className="text-xs">Descripción</Label>}
                <Input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Descripción..." />
              </div>
              <div>
                {idx === 0 && <Label className="text-xs">Cant.</Label>}
                <Input
                  type="number" min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                {idx === 0 && <Label className="text-xs">Precio (RD$)</Label>}
                <Input
                  type="number" min="0" step="0.01"
                  value={item.unitPrice || ""}
                  onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className={idx === 0 ? "pt-5" : ""}>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-xl">×</button>
                )}
              </div>
            </div>
          ))}

          <Button type="button" variant="ghost" size="sm" onClick={addItem}>+ Agregar ítem</Button>

          <div className="space-y-1 text-sm border-t pt-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>RD$ {subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" checked={applyItbis} onChange={(e) => setApplyItbis(e.target.checked)} className="rounded" />
                Aplicar ITBIS (18%)
              </label>
              <span className="text-gray-600">RD$ {itbisAmount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>RD$ {total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={createInvoice.isPending}>
            {createInvoice.isPending ? "Generando..." : "Generar factura"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/facturas")}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
