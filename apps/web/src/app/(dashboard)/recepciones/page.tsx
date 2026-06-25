"use client";

import { useState } from "react";
import Link from "next/link";
import { useReceptions } from "@/hooks/useReceptions";

export default function RecepcionesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useReceptions(page);

  const receptions = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Recepciones</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} en total</p>
        </div>
        <Link
          href="/recepciones/nueva"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-[var(--gf-primary-hover)] transition-colors"
        >
          + Nueva recepción
        </Link>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : receptions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Sin recepciones</p>
          <p className="text-sm mt-1">Registra la primera entrada de un vehículo</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vehículo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Problema</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Km entrada</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {receptions.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.customer_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.vehicle_label}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.reported_problem}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.entry_km.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(r.created_at).toLocaleDateString("es-DO")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/recepciones/${r.id}`}
                      className="text-xs font-medium text-foreground hover:text-white underline underline-offset-2"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
