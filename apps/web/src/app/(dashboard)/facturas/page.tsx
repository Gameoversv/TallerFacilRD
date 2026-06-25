"use client";

import { useState } from "react";
import Link from "next/link";
import { useInvoices } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { InvoiceStatus } from "@/types/invoice";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  ANULADA: "Anulada",
};

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  PAGADA: "bg-green-100 text-green-800",
  ANULADA: "bg-gray-100 text-gray-500",
};

export default function FacturasPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useInvoices(page);

  const invoices = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facturas</h1>
          <p className="text-sm text-gray-500">{total} registros</p>
        </div>
        <Link href="/facturas/nueva">
          <Button>+ Nueva factura</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                    Sin facturas registradas
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.customer_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{inv.vehicle_label}</TableCell>
                  <TableCell>{new Date(inv.issue_date).toLocaleDateString("es-DO")}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status]}`}>
                      {STATUS_LABEL[inv.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    RD$ {inv.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
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
          <span className="text-gray-500">Página {page + 1} de {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  );
}
