"use client";

import { useState } from "react";
import Link from "next/link";
import { usePurchases } from "@/hooks/usePurchases";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ComprasPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = usePurchases(page);

  const purchases = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Compras</h1>
          <p className="text-sm text-muted-foreground">{total} registros</p>
        </div>
        <Link href="/compras/nueva">
          <Button>+ Nueva compra</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Ítems</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Sin compras registradas
                  </TableCell>
                </TableRow>
              )}
              {purchases.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/40">
                  <TableCell>
                    {new Date(p.purchase_date).toLocaleDateString("es-DO")}
                  </TableCell>
                  <TableCell className="font-medium">{p.supplier_name}</TableCell>
                  <TableCell className="text-right">{p.items?.length ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">
                    RD$ {p.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/compras/${p.id}`}>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
