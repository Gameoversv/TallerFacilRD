"use client";

import { useState } from "react";
import Link from "next/link";
import { useInvoices } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";

export default function CuentasCobrarPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useInvoices(page);

  const all = data?.data ?? [];
  const invoices = all.filter((inv) => inv.status === "PENDIENTE");
  const totalPages = Math.ceil((data?.meta?.total ?? 0) / 20);

  const totalPendiente = invoices.reduce((sum, inv) => sum + inv.remaining_balance, 0);

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
      header: "Total",
      className: "text-right",
      cell: (inv) => (
        <span>RD$ {inv.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      header: "Pagado",
      className: "text-right",
      cell: (inv) => (
        <span className="text-success">
          RD$ {inv.paid_amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Pendiente",
      className: "text-right",
      cell: (inv) => (
        <span className="font-semibold text-warning">
          RD$ {inv.remaining_balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
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
        title="Cuentas por Cobrar"
        description={`${invoices.length} facturas pendientes · Total: RD$ ${totalPendiente.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`}
      />

      <ResponsiveList
        items={invoices}
        columns={columns}
        getKey={(inv) => inv.id}
        isLoading={isLoading}
        emptyMessage="Sin facturas pendientes de cobro"
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
