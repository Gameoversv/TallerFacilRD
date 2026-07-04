"use client";

import { useState } from "react";
import Link from "next/link";
import { usePurchases } from "@/hooks/usePurchases";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";

export default function ComprasPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = usePurchases(page);

  const purchases = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const columns: ResponsiveColumn<(typeof purchases)[number]>[] = [
    {
      header: "Fecha",
      primary: true,
      cell: (p) => new Date(p.purchase_date).toLocaleDateString("es-DO"),
    },
    {
      header: "Proveedor",
      cell: (p) => <span className="font-medium">{p.supplier_name}</span>,
    },
    {
      header: "Ítems",
      className: "text-right",
      cell: (p) => p.items?.length ?? "—",
    },
    {
      header: "Total",
      className: "text-right",
      cell: (p) => (
        <span className="font-medium">
          RD$ {p.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "",
      isAction: true,
      className: "w-24",
      cell: (p) => (
        <Link href={`/compras/${p.id}`}>
          <Button variant="ghost" size="sm">Ver</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Compras"
        description={`${total} registros`}
        actions={
          <Link href="/compras/nueva">
            <Button className="w-full sm:w-auto">+ Nueva compra</Button>
          </Link>
        }
      />

      <ResponsiveList
        items={purchases}
        columns={columns}
        getKey={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="Sin compras registradas"
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
