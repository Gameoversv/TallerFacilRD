"use client";

import { useState } from "react";
import Link from "next/link";
import { useInvoices } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";
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

export default function FacturasPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useInvoices(page);

  const invoices = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const columns: ResponsiveColumn<(typeof invoices)[number]>[] = [
    {
      header: "N° Factura",
      primary: true,
      cell: (inv) => <span className="font-mono font-medium">{inv.invoice_number}</span>,
    },
    { header: "Cliente", cell: (inv) => inv.customer_name },
    {
      header: "Vehículo",
      cell: (inv) => <span className="text-sm text-muted-foreground">{inv.vehicle_label}</span>,
    },
    { header: "Fecha", cell: (inv) => new Date(inv.issue_date).toLocaleDateString("es-DO") },
    {
      header: "Estado",
      cell: (inv) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status]}`}>
          {STATUS_LABEL[inv.status]}
        </span>
      ),
    },
    {
      header: "Total",
      className: "text-right",
      cell: (inv) => (
        <span className="font-medium">
          RD$ {inv.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "",
      isAction: true,
      className: "w-20",
      cell: (inv) => (
        <Link href={`/facturas/${inv.id}`}>
          <Button variant="ghost" size="sm">Ver</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Facturas"
        description={`${total} registros`}
        actions={
          <Link href="/facturas/nueva">
            <Button className="w-full sm:w-auto">+ Nueva factura</Button>
          </Link>
        }
      />

      <ResponsiveList
        items={invoices}
        columns={columns}
        getKey={(inv) => inv.id}
        isLoading={isLoading}
        emptyMessage="Sin facturas registradas"
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
    </div>
  );
}
