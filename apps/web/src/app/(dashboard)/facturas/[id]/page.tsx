"use client";

import { use } from "react";
import Link from "next/link";
import { useInvoice, useUpdateInvoiceStatus } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import PaymentSection from "@/components/payments/PaymentSection";
import type { InvoiceStatus } from "@/types/invoice";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  ANULADA: "Anulada",
};

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  PENDIENTE: "bg-warning/15 text-warning",
  PAGADA: "bg-success/15 text-success",
  ANULADA: "bg-muted text-muted-foreground",
};

export default function FacturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useInvoice(id);
  const updateStatus = useUpdateInvoiceStatus(id);
  const inv = data?.data;

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;
  if (!inv) return <p className="text-sm text-destructive">Factura no encontrada</p>;

  const manoObra = inv.items.filter((i) => i.item_type === "MANO_OBRA");
  const piezas = inv.items.filter((i) => i.item_type === "PIEZA");

  async function handleStatus(status: InvoiceStatus) {
    if (status === "ANULADA" && !confirm("¿Confirmas anular esta factura?")) return;
    await updateStatus.mutateAsync(status);
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header — hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/facturas">
          <Button variant="ghost">← Facturas</Button>
        </Link>
        <div className="flex gap-2">
          {inv.status === "PENDIENTE" && (
            <>
              <Button size="sm" onClick={() => handleStatus("PAGADA")} disabled={updateStatus.isPending}>
                Marcar pagada
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleStatus("ANULADA")} disabled={updateStatus.isPending}>
                Anular
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            🖨 Imprimir
          </Button>
        </div>
      </div>

      {/* Invoice document */}
      <div className="rounded-lg border bg-card p-8 space-y-6 print:border-none print:p-0 print:shadow-none">
        {/* Top */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">🔧 TallerFácil RD</h1>
            <p className="text-sm text-muted-foreground mt-1">Sistema de gestión de taller</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold font-mono">{inv.invoice_number}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status]}`}>
              {STATUS_LABEL[inv.status]}
            </span>
          </div>
        </div>

        {/* Client & vehicle */}
        <div className="grid grid-cols-2 gap-6 text-sm border-t border-b py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Cliente</p>
            <p className="font-medium">{inv.customer_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Vehículo</p>
            <p className="font-medium">{inv.vehicle_label}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Fecha emisión</p>
            <p>{new Date(inv.issue_date).toLocaleDateString("es-DO")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Orden de trabajo</p>
            <p className="font-mono text-xs text-muted-foreground">{inv.work_order_id}</p>
          </div>
        </div>

        {/* Items */}
        {manoObra.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Mano de obra</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground text-xs">
                  <th className="pb-1">Descripción</th>
                  <th className="pb-1 w-16 text-center">Cant.</th>
                  <th className="pb-1 w-32 text-right">Precio</th>
                  <th className="pb-1 w-32 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {manoObra.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5">{item.description}</td>
                    <td className="py-1.5 text-center text-muted-foreground">{item.quantity}</td>
                    <td className="py-1.5 text-right text-muted-foreground">RD$ {item.unit_price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
                    <td className="py-1.5 text-right font-medium">RD$ {item.subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {piezas.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Piezas y repuestos</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground text-xs">
                  <th className="pb-1">Descripción</th>
                  <th className="pb-1 w-16 text-center">Cant.</th>
                  <th className="pb-1 w-32 text-right">Precio</th>
                  <th className="pb-1 w-32 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {piezas.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5">{item.description}</td>
                    <td className="py-1.5 text-center text-muted-foreground">{item.quantity}</td>
                    <td className="py-1.5 text-right text-muted-foreground">RD$ {item.unit_price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
                    <td className="py-1.5 text-right font-medium">RD$ {item.subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-1 text-sm border-t pt-4 max-w-xs ml-auto">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>RD$ {inv.subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
          </div>
          {inv.apply_itbis && (
            <div className="flex justify-between text-muted-foreground">
              <span>ITBIS (18%)</span>
              <span>RD$ {inv.itbis_amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-1">
            <span>Total</span>
            <span>RD$ {inv.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {inv.notes && (
          <p className="text-xs text-muted-foreground border-t pt-3">
            <span className="font-medium">Notas: </span>{inv.notes}
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center pt-4 border-t">
          Gracias por su preferencia — TallerFácil RD
        </p>
      </div>

      {/* Payments section — hidden on print */}
      <div className="rounded-lg border bg-card p-6 print:hidden">
        <h2 className="text-base font-semibold mb-4">Pagos</h2>
        <PaymentSection
          invoiceId={id}
          total={inv.total}
          paidAmount={inv.paid_amount}
          remainingBalance={inv.remaining_balance}
          status={inv.status}
        />
      </div>
    </div>
  );
}
