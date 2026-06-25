"use client";

import { useState } from "react";
import Link from "next/link";
import { useInvoices } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function CuentasCobrarPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useInvoices(page);

  const all = data?.data ?? [];
  const invoices = all.filter((inv) => inv.status === "PENDIENTE");
  const totalPages = Math.ceil((data?.meta?.total ?? 0) / 20);

  const totalPendiente = invoices.reduce((sum, inv) => sum + inv.remaining_balance, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Cuentas por Cobrar</h1>
        <p className="text-sm text-muted-foreground">
          {invoices.length} facturas pendientes · Total: RD${" "}
          {totalPendiente.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Pagado</TableHead>
                <TableHead className="text-right">Pendiente</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Sin facturas pendientes de cobro
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.customer_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.vehicle_label}</TableCell>
                  <TableCell>{new Date(inv.issue_date).toLocaleDateString("es-DO")}</TableCell>
                  <TableCell className="text-right">
                    RD$ {inv.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right text-success">
                    RD$ {inv.paid_amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-warning">
                    RD$ {inv.remaining_balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/facturas/${inv.id}`}>
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
