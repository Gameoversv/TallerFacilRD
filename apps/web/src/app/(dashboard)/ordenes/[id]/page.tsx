"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  useWorkOrder,
  useUpdateWorkOrderStatus,
  useUpdateDiagnostic,
  useAddWorkOrderItem,
  useRemoveWorkOrderItem,
} from "@/hooks/useWorkOrders";
import type { WorkOrderStatus, WorkOrderPriority, WorkOrderItemType } from "@/types/work-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QuoteSection from "@/components/quotes/QuoteSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  EN_PROGRESO: "bg-blue-100 text-blue-800",
  COMPLETADA: "bg-green-100 text-green-800",
  CANCELADA: "bg-gray-100 text-gray-600",
};

const TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  PENDIENTE: ["EN_PROGRESO", "CANCELADA"],
  EN_PROGRESO: ["COMPLETADA", "CANCELADA"],
  COMPLETADA: [],
  CANCELADA: [],
};

const TRANSITION_LABELS: Partial<Record<WorkOrderStatus, string>> = {
  EN_PROGRESO: "Iniciar trabajo",
  COMPLETADA: "Marcar completada",
  CANCELADA: "Cancelar orden",
};

const TRANSITION_VARIANTS: Partial<Record<WorkOrderStatus, "default" | "destructive" | "ghost">> = {
  EN_PROGRESO: "default",
  COMPLETADA: "default",
  CANCELADA: "destructive",
};

const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  BAJA: "bg-gray-100 text-gray-600",
  MEDIA: "bg-blue-100 text-blue-700",
  ALTA: "bg-orange-100 text-orange-700",
  CRITICA: "bg-red-100 text-red-700",
};

export default function OrdenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data, isLoading } = useWorkOrder(id);
  const wo = data?.data;

  const updateStatus = useUpdateWorkOrderStatus(id);
  const updateDiagnostic = useUpdateDiagnostic(id);
  const addItem = useAddWorkOrderItem(id);
  const removeItem = useRemoveWorkOrderItem(id);

  const [itemDesc, setItemDesc] = useState("");
  const [itemType, setItemType] = useState<WorkOrderItemType>("LABOR");
  const [itemQty, setItemQty] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [itemError, setItemError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [editingDiag, setEditingDiag] = useState(false);
  const [diagText, setDiagText] = useState("");
  const [diagPriority, setDiagPriority] = useState<WorkOrderPriority>("MEDIA");

  if (isLoading) return <p className="text-sm text-gray-400">Cargando...</p>;
  if (!wo) return <p className="text-sm text-red-500">Orden no encontrada.</p>;

  const totalItems = wo.items.reduce((acc, i) => acc + i.total, 0);
  const canEdit = wo.status === "PENDIENTE" || wo.status === "EN_PROGRESO";

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setItemError(null);
    if (!itemDesc.trim() || !itemPrice) return;
    try {
      await addItem.mutateAsync({
        description: itemDesc.trim(),
        type: itemType,
        quantity: parseFloat(itemQty),
        unitPrice: parseFloat(itemPrice),
      });
      setItemDesc("");
      setItemQty("1");
      setItemPrice("");
    } catch {
      setItemError("No se pudo agregar el ítem.");
    }
  }

  async function handleStatusChange(next: WorkOrderStatus) {
    if (
      next === "CANCELADA" &&
      !confirm("¿Confirmas que deseas cancelar esta orden de trabajo?")
    )
      return;
    setStatusError(null);
    try {
      await updateStatus.mutateAsync(next);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Error al cambiar estado";
      setStatusError(msg);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push("/ordenes")}
            className="text-sm text-gray-400 hover:text-gray-600 mb-1 flex items-center gap-1"
          >
            ← Órdenes de trabajo
          </button>
          <h1 className="text-2xl font-bold">{wo.vehicle_label}</h1>
          <p className="text-sm text-gray-500">{wo.customer_name}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[wo.status]}`}
            >
              {STATUS_LABELS[wo.status]}
            </span>
            {TRANSITIONS[wo.status].map((next) => (
              <Button
                key={next}
                variant={TRANSITION_VARIANTS[next] ?? "default"}
                size="sm"
                disabled={updateStatus.isPending}
                onClick={() => handleStatusChange(next)}
              >
                {updateStatus.isPending ? "..." : TRANSITION_LABELS[next]}
              </Button>
            ))}
          </div>
          {statusError && (
            <p className="text-xs text-red-600 font-medium">{statusError}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-700">Diagnóstico</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[wo.priority ?? "MEDIA"]}`}>
                {PRIORITY_LABELS[wo.priority ?? "MEDIA"]}
              </span>
            </div>
            {canEdit && !editingDiag && (
              <button
                onClick={() => {
                  setDiagText(wo.diagnosis ?? "");
                  setDiagPriority(wo.priority ?? "MEDIA");
                  setEditingDiag(true);
                }}
                className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2"
              >
                Editar
              </button>
            )}
          </div>

          {editingDiag ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Prioridad</label>
                <select
                  value={diagPriority}
                  onChange={(e) => setDiagPriority(e.target.value as WorkOrderPriority)}
                  className="w-full h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica</option>
                </select>
              </div>
              <textarea
                rows={4}
                value={diagText}
                onChange={(e) => setDiagText(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                placeholder="Descripción técnica del diagnóstico..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={updateDiagnostic.isPending}
                  onClick={async () => {
                    await updateDiagnostic.mutateAsync({ diagnosis: diagText, priority: diagPriority });
                    setEditingDiag(false);
                  }}
                >
                  {updateDiagnostic.isPending ? "Guardando..." : "Guardar"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingDiag(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {wo.diagnosis ?? <span className="italic text-gray-400">Sin diagnóstico</span>}
            </p>
          )}
        </div>
        <div className="rounded-lg border bg-white p-5 space-y-3">
          <h2 className="font-semibold text-gray-700">Detalles</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-500">Técnico</dt>
              <dd className="font-medium">{wo.assigned_to ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Costo estimado</dt>
              <dd className="font-medium">
                {wo.estimated_cost != null
                  ? `RD$${wo.estimated_cost.toLocaleString()}`
                  : "—"}
              </dd>
            </div>
            {wo.actual_cost != null && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Costo real</dt>
                <dd className="font-semibold text-green-700">
                  RD${wo.actual_cost.toLocaleString()}
                </dd>
              </div>
            )}
            {wo.started_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Inicio</dt>
                <dd>{new Date(wo.started_at).toLocaleString("es-DO")}</dd>
              </div>
            )}
            {wo.completed_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Completada</dt>
                <dd>{new Date(wo.completed_at).toLocaleString("es-DO")}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Ítems de trabajo</h2>
          <span className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-900">RD${totalItems.toLocaleString()}</span>
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="text-right">Precio unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
              {canEdit && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {wo.items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 6 : 5}
                  className="text-center text-gray-400 py-6 text-sm"
                >
                  Sin ítems agregados
                </TableCell>
              </TableRow>
            )}
            {wo.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.type === "LABOR"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.type === "LABOR" ? "Mano de obra" : "Repuesto"}
                  </span>
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">RD${item.unit_price.toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">RD${item.total.toLocaleString()}</TableCell>
                {canEdit && (
                  <TableCell>
                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {canEdit && (
          <form
            onSubmit={handleAddItem}
            className="border-t pt-4 grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-end"
          >
            <div>
              <label className="text-xs text-gray-500 block mb-1">Descripción</label>
              <Input
                placeholder="Ej: Cambio de pastillas"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tipo</label>
              <select
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={itemType}
                onChange={(e) => setItemType(e.target.value as WorkOrderItemType)}
              >
                <option value="LABOR">Mano de obra</option>
                <option value="PARTS">Repuesto</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Cant.</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                className="w-20"
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Precio (RD$)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="w-28"
                placeholder="0.00"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={addItem.isPending}>
              + Agregar
            </Button>
          </form>
        )}

        {itemError && (
          <p className="text-xs text-red-600">{itemError}</p>
        )}
      </div>

      <div className="rounded-lg border bg-white p-5">
        <QuoteSection workOrderId={id} canEdit={canEdit} />
      </div>
    </div>
  );
}
