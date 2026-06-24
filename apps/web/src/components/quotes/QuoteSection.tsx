"use client";

import { useState } from "react";
import { useWorkOrderQuotes, useCreateQuote, useUpdateQuoteStatus } from "@/hooks/useQuotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Quote, QuoteItemInput, QuoteItemType } from "@/types/quote";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
};

const STATUS_COLOR: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  APROBADA: "bg-green-100 text-green-800",
  RECHAZADA: "bg-red-100 text-red-800",
};

interface Props {
  workOrderId: string;
  canEdit: boolean;
}

export default function QuoteSection({ workOrderId, canEdit }: Props) {
  const { data, isLoading } = useWorkOrderQuotes(workOrderId);
  const createQuote = useCreateQuote();

  const [showForm, setShowForm] = useState(false);
  const [applyItbis, setApplyItbis] = useState(false);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuoteItemInput[]>([
    { itemType: "MANO_OBRA", description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const quotes = data?.data ?? [];

  function addItem() {
    setItems((prev) => [
      ...prev,
      { itemType: "MANO_OBRA", description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem<K extends keyof QuoteItemInput>(idx: number, field: K, value: QuoteItemInput[K]) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const itbisAmount = applyItbis ? subtotal * 0.18 : 0;
  const total = subtotal + itbisAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (items.some((i) => !i.description.trim())) {
      setFormError("Todos los ítems deben tener descripción");
      return;
    }
    if (items.some((i) => i.unitPrice <= 0)) {
      setFormError("Todos los precios deben ser mayores a 0");
      return;
    }
    try {
      await createQuote.mutateAsync({ workOrderId, applyItbis, notes: notes || undefined, items });
      setShowForm(false);
      setItems([{ itemType: "MANO_OBRA", description: "", quantity: 1, unitPrice: 0 }]);
      setNotes("");
      setApplyItbis(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setFormError(e?.response?.data?.error ?? e?.message ?? "Error al crear cotización");
    }
  }

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cotizaciones</h2>
        {canEdit && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            + Nueva cotización
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-5 space-y-4">
          <h3 className="font-medium text-gray-700">Nueva cotización</h3>

          {/* Items */}
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[120px_1fr_80px_120px_32px] gap-2 items-end">
                <div>
                  {idx === 0 && <Label className="text-xs">Tipo</Label>}
                  <select
                    value={item.itemType}
                    onChange={(e) => updateItem(idx, "itemType", e.target.value as QuoteItemType)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm"
                  >
                    <option value="MANO_OBRA">Mano de obra</option>
                    <option value="PIEZA">Pieza</option>
                  </select>
                </div>
                <div>
                  {idx === 0 && <Label className="text-xs">Descripción</Label>}
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    placeholder="Descripción..."
                  />
                </div>
                <div>
                  {idx === 0 && <Label className="text-xs">Cant.</Label>}
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  {idx === 0 && <Label className="text-xs">Precio unit. (RD$)</Label>}
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice || ""}
                    onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className={idx === 0 ? "pt-5" : ""}>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-400 hover:text-red-600 text-xl leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={addItem}>
              + Agregar ítem
            </Button>
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm border-t pt-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>RD$ {subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyItbis}
                  onChange={(e) => setApplyItbis(e.target.checked)}
                  className="rounded"
                />
                Aplicar ITBIS (18%)
              </label>
              <span className="text-gray-600">
                RD$ {itbisAmount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>RD$ {total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notas (opcional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." />
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={createQuote.isPending}>
              {createQuote.isPending ? "Guardando..." : "Guardar cotización"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {quotes.length === 0 && !showForm && (
        <p className="text-sm text-gray-400">Sin cotizaciones</p>
      )}

      {quotes.map((q) => (
        <QuoteCard key={q.id} quote={q} workOrderId={workOrderId} />
      ))}
    </div>
  );
}

function QuoteCard({ quote, workOrderId }: { quote: Quote; workOrderId: string }) {
  const updateStatus = useUpdateQuoteStatus(quote.id, workOrderId);
  const [confirming, setConfirming] = useState<"APROBADA" | "RECHAZADA" | null>(null);

  async function handleStatus(status: "APROBADA" | "RECHAZADA") {
    await updateStatus.mutateAsync(status);
    setConfirming(null);
  }

  const manoObra = quote.items.filter((i) => i.item_type === "MANO_OBRA");
  const piezas = quote.items.filter((i) => i.item_type === "PIEZA");

  return (
    <div className="rounded-lg border bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[quote.status]}`}>
          {STATUS_LABEL[quote.status]}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(quote.created_at).toLocaleDateString("es-DO")}
        </span>
      </div>

      {manoObra.length > 0 && (
        <ItemTable title="Mano de obra" items={manoObra} />
      )}
      {piezas.length > 0 && (
        <ItemTable title="Piezas" items={piezas} />
      )}

      <div className="text-sm space-y-1 border-t pt-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>RD$ {quote.subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
        </div>
        {quote.apply_itbis && (
          <div className="flex justify-between text-gray-600">
            <span>ITBIS (18%)</span>
            <span>RD$ {quote.itbis_amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>RD$ {quote.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {quote.notes && (
        <p className="text-xs text-gray-500 italic">{quote.notes}</p>
      )}

      {quote.status === "PENDIENTE" && (
        <div className="flex gap-2 pt-1">
          {confirming === "APROBADA" ? (
            <>
              <Button size="sm" onClick={() => handleStatus("APROBADA")} disabled={updateStatus.isPending}>
                Confirmar aprobación
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>Cancelar</Button>
            </>
          ) : confirming === "RECHAZADA" ? (
            <>
              <Button size="sm" variant="destructive" onClick={() => handleStatus("RECHAZADA")} disabled={updateStatus.isPending}>
                Confirmar rechazo
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>Cancelar</Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => setConfirming("APROBADA")}>Aprobar</Button>
              <Button size="sm" variant="outline" onClick={() => setConfirming("RECHAZADA")}>Rechazar</Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ItemTable({ title, items }: { title: string; items: Quote["items"] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{title}</p>
      <table className="w-full text-sm">
        <tbody className="divide-y">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-1 text-gray-700">{item.description}</td>
              <td className="py-1 text-center text-gray-500 w-12">{item.quantity}</td>
              <td className="py-1 text-right text-gray-500 w-32">
                RD$ {item.unit_price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
              </td>
              <td className="py-1 text-right font-medium w-32">
                RD$ {item.subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
