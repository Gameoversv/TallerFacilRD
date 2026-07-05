"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Printer, ChevronLeft, Loader2 } from "lucide-react";
import portalApi from "@/lib/portalApi";

interface InvoiceItem {
  id: string;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  work_order_id: string;
  vehicle_label: string;
  customer_name: string;
  issue_date: string;
  status: string;
  apply_itbis: boolean;
  itbis_rate: number;
  subtotal: number;
  itbis_amount: number;
  total: number;
  paid_amount: number;
  remaining_balance: number;
  notes: string | null;
  items: InvoiceItem[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  ANULADA: "Anulada",
};

const STATUS_PAPER: Record<string, string> = {
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  PAGADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ANULADA: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

function money(n: number) {
  return `RD$ ${Number(n).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
}

function usePortalInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ["portal", "invoice", invoiceId],
    queryFn: async () => {
      const res = await portalApi.get<{ data: InvoiceDetail }>(
        `/api/portal/invoices/${invoiceId}`
      );
      return res.data.data;
    },
  });
}

export default function PortalInvoiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const { data: inv, isLoading, isError } = usePortalInvoice(id);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando factura…
      </div>
    );
  }

  if (isError || !inv) {
    return <p className="text-sm text-destructive">Factura no encontrada.</p>;
  }

  const manoObra = inv.items.filter((i) => i.item_type === "MANO_OBRA");
  const piezas = inv.items.filter((i) => i.item_type === "PIEZA");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Action bar — hidden on print */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link
          href={`/portal/${slug}/mis-facturas`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Mis Facturas
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors sm:w-auto"
        >
          <Printer className="h-4 w-4" />
          Imprimir / PDF
        </button>
      </div>

      {/* Invoice document */}
      <div className="rounded-2xl border border-border bg-white text-zinc-900 shadow-sm print:rounded-none print:border-0 print:shadow-none">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Factura
            </p>
            <p className="nums mt-1 text-2xl font-bold text-zinc-900">
              {inv.invoice_number}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              {new Date(inv.issue_date).toLocaleDateString("es-DO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`self-start rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_PAPER[inv.status] ?? "bg-zinc-100 text-zinc-500 border-zinc-200"}`}
          >
            {STATUS_LABEL[inv.status] ?? inv.status}
          </span>
        </div>

        {/* Customer + Vehicle */}
        <div className="grid grid-cols-1 gap-6 border-b border-zinc-100 px-5 py-6 sm:grid-cols-2 sm:px-8">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Cliente
            </p>
            <p className="font-semibold text-zinc-900">{inv.customer_name}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Vehículo
            </p>
            <p className="font-semibold text-zinc-900">{inv.vehicle_label}</p>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 py-6 space-y-6 sm:px-8">
          {manoObra.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Mano de Obra
              </p>
              <ItemTable items={manoObra} />
            </div>
          )}

          {piezas.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Piezas / Materiales
              </p>
              <ItemTable items={piezas} />
            </div>
          )}

          {inv.notes && (
            <div className="rounded-lg bg-zinc-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                Notas
              </p>
              <p className="text-sm text-zinc-700">{inv.notes}</p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-zinc-100 px-5 py-6 sm:px-8">
          <div className="ml-auto max-w-xs space-y-2">
            <Row label="Subtotal" value={money(inv.subtotal)} />
            {inv.apply_itbis && (
              <Row
                label={`ITBIS (${(inv.itbis_rate * 100).toFixed(0)}%)`}
                value={money(inv.itbis_amount)}
              />
            )}
            <div className="my-2 border-t border-zinc-200" />
            <Row label="Total" value={money(inv.total)} bold />
            {inv.paid_amount > 0 && (
              <>
                <Row label="Pagado" value={money(inv.paid_amount)} />
                <Row
                  label="Balance"
                  value={money(inv.remaining_balance)}
                  bold={inv.remaining_balance > 0}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemTable({ items }: { items: InvoiceDetail["items"] }) {
  return (
    <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[480px] text-sm">
      <thead>
        <tr className="border-b border-zinc-100 text-left">
          <th className="pb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Descripción
          </th>
          <th className="pb-2 text-right text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Cant.
          </th>
          <th className="pb-2 text-right text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Precio
          </th>
          <th className="pb-2 text-right text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Total
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50">
        {items.map((item) => (
          <tr key={item.id}>
            <td className="py-2.5 text-zinc-800">{item.description}</td>
            <td className="nums py-2.5 text-right text-zinc-600">{item.quantity}</td>
            <td className="nums py-2.5 text-right text-zinc-600">
              {money(item.unit_price)}
            </td>
            <td className="nums py-2.5 text-right font-medium text-zinc-900">
              {money(item.subtotal)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-semibold text-zinc-900" : "text-zinc-500"}`}>
        {label}
      </span>
      <span className={`nums text-sm ${bold ? "font-bold text-zinc-900" : "text-zinc-700"}`}>
        {value}
      </span>
    </div>
  );
}
