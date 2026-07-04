"use client";

import { use } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { useInvoice, useUpdateInvoiceStatus } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/Logo";
import PaymentSection from "@/components/payments/PaymentSection";
import type { InvoiceItem, InvoiceStatus } from "@/types/invoice";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  ANULADA: "Anulada",
};

// Light, print-safe status pills for the paper document
const STATUS_PAPER: Record<InvoiceStatus, string> = {
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  PAGADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ANULADA: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

function money(n: number): string {
  return `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
}

export default function FacturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useInvoice(id);
  const updateStatus = useUpdateInvoiceStatus(id);
  const inv = data?.data;

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Cargando...</p>;
  if (!inv)
    return <p className="text-sm text-destructive">Factura no encontrada</p>;

  const manoObra = inv.items.filter((i) => i.item_type === "MANO_OBRA");
  const piezas = inv.items.filter((i) => i.item_type === "PIEZA");

  async function handleStatus(status: InvoiceStatus) {
    if (status === "ANULADA" && !confirm("¿Confirmas anular esta factura?"))
      return;
    await updateStatus.mutateAsync(status);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Action bar — hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/facturas">
          <Button variant="ghost">← Facturas</Button>
        </Link>
        <div className="flex gap-2">
          {inv.status === "PENDIENTE" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatus("PAGADA")}
                disabled={updateStatus.isPending}
              >
                Marcar pagada
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatus("ANULADA")}
                disabled={updateStatus.isPending}
              >
                Anular
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      {/* ===== Invoice paper (white, print-ready) ===== */}
      <article className="print-exact relative overflow-hidden rounded-2xl bg-white text-zinc-900 shadow-2xl shadow-black/40 print:rounded-none print:shadow-none">
        {/* Brand accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#34b6ff] via-[#00a3ff] to-[#0091e6]" />

        <div className="space-y-7 p-8 sm:p-10 print:p-8">
          {/* Header */}
          <header className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <LogoMark className="h-10 w-10" />
              <div className="leading-tight">
                <p className="font-display text-xl font-bold tracking-tight text-zinc-900">
                  Workshop<span className="text-[#0091e6]">Track</span>
                </p>
                <p className="text-xs text-zinc-500">
                  Gestión integral de taller mecánico
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Santo Domingo, República Dominicana
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Factura
              </p>
              <p className="nums text-lg font-semibold text-zinc-900">
                {inv.invoice_number}
              </p>
              <span
                className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_PAPER[inv.status]}`}
              >
                {STATUS_LABEL[inv.status]}
              </span>
            </div>
          </header>

          {/* Bill-to */}
          <section className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 text-sm sm:grid-cols-2">
            <Field label="Cliente" value={inv.customer_name} strong />
            <Field label="Vehículo" value={inv.vehicle_label} strong />
            <Field
              label="Fecha de emisión"
              value={new Date(inv.issue_date).toLocaleDateString("es-DO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
            <Field
              label="Orden de trabajo"
              value={inv.work_order_id}
              mono
            />
          </section>

          {/* Line items */}
          {manoObra.length > 0 && (
            <ItemTable title="Mano de obra" items={manoObra} />
          )}
          {piezas.length > 0 && (
            <ItemTable title="Piezas y repuestos" items={piezas} />
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="nums text-zinc-700">{money(inv.subtotal)}</span>
              </div>
              {inv.apply_itbis && (
                <div className="flex justify-between text-zinc-500">
                  <span>ITBIS (18%)</span>
                  <span className="nums text-zinc-700">
                    {money(inv.itbis_amount)}
                  </span>
                </div>
              )}
              <div className="mt-1 flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3 text-white">
                <span className="text-sm font-semibold">Total</span>
                <span className="nums text-lg font-bold">
                  {money(inv.total)}
                </span>
              </div>
              {inv.status !== "ANULADA" && inv.remaining_balance > 0 && (
                <div className="flex justify-between pt-1 text-xs text-amber-600">
                  <span>Balance pendiente</span>
                  <span className="nums font-semibold">
                    {money(inv.remaining_balance)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {inv.notes && (
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
              <span className="font-semibold text-zinc-700">Notas: </span>
              {inv.notes}
            </p>
          )}

          {/* Footer */}
          <footer className="border-t border-zinc-200 pt-5 text-center">
            <p className="text-sm font-medium text-zinc-700">
              Gracias por confiar en nuestro taller
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              Documento generado por WorkshopTrack · {inv.invoice_number}
            </p>
          </footer>
        </div>
      </article>

      {/* Payments — hidden on print */}
      <div className="rounded-xl border border-border bg-card p-6 print:hidden">
        <h2 className="mb-4 font-display text-base font-semibold text-white">
          Pagos
        </h2>
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

function Field({
  label,
  value,
  strong,
  mono,
}: {
  label: string;
  value: string;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p
        className={[
          mono ? "nums text-xs text-zinc-500" : "",
          strong ? "font-semibold text-zinc-900" : "text-zinc-700",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function ItemTable({
  title,
  items,
}: {
  title: string;
  items: InvoiceItem[];
}) {
  return (
    <section>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-400">
              <th className="pb-2 font-medium">Descripción</th>
              <th className="w-16 pb-2 text-center font-medium">Cant.</th>
              <th className="w-32 pb-2 text-right font-medium">Precio</th>
              <th className="w-32 pb-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 text-zinc-800">{item.description}</td>
                <td className="py-2 text-center text-zinc-500">
                  <span className="nums">{item.quantity}</span>
                </td>
                <td className="py-2 text-right text-zinc-500">
                  <span className="nums">{money(item.unit_price)}</span>
                </td>
                <td className="py-2 text-right font-medium text-zinc-900">
                  <span className="nums">{money(item.subtotal)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
