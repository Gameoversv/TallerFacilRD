"use client";

import { useState } from "react";
import Link from "next/link";
import { useReceptions } from "@/hooks/useReceptions";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";
import type { Reception } from "@/types/reception";

export default function RecepcionesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useReceptions(page);

  const receptions = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const columns: ResponsiveColumn<Reception>[] = [
    { header: "Cliente", primary: true, cell: (r) => r.customer_name },
    { header: "Vehículo", cell: (r) => r.vehicle_label },
    {
      header: "Problema",
      cell: (r) => r.reported_problem,
      className: "max-w-xs truncate",
    },
    { header: "Km entrada", cell: (r) => `${r.entry_km.toLocaleString()} km` },
    {
      header: "Fecha",
      cell: (r) => new Date(r.created_at).toLocaleDateString("es-DO"),
    },
    {
      header: "",
      isAction: true,
      cell: (r) => (
        <Link
          href={`/recepciones/${r.id}`}
          className="text-xs font-medium text-foreground hover:text-white underline underline-offset-2"
        >
          Ver
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recepciones"
        description={`${total} en total`}
        actions={
          <Link
            href="/recepciones/nueva"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-[var(--gf-primary-hover)] transition-colors sm:w-auto"
          >
            + Nueva recepción
          </Link>
        }
      />

      {!isLoading && receptions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Sin recepciones</p>
          <p className="text-sm mt-1">Registra la primera entrada de un vehículo</p>
        </div>
      ) : (
        <ResponsiveList
          items={receptions}
          columns={columns}
          getKey={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Sin recepciones"
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted/40"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted/40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
