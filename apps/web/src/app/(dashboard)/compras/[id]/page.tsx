"use client";

import { use } from "react";
import Link from "next/link";
import { usePurchase } from "@/hooks/usePurchases";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function CompraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = usePurchase(id);
  const purchase = data?.data;

  if (isLoading) return <p className="text-sm text-gray-400">Cargando...</p>;
  if (!purchase) return <p className="text-sm text-red-500">Compra no encontrada</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detalle de compra</h1>
          <p className="text-sm text-gray-500">
            {new Date(purchase.purchase_date).toLocaleDateString("es-DO")} · {purchase.supplier_name}
          </p>
        </div>
        <Link href="/compras">
          <Button variant="ghost">← Volver</Button>
        </Link>
      </div>

      {purchase.notes && (
        <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Notas: </span>{purchase.notes}
        </div>
      )}

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Costo unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchase.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm">{item.product_code}</TableCell>
                <TableCell>{item.product_description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  RD$ {item.unit_cost.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-medium">
                  RD$ {item.subtotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 font-bold">
              <TableCell colSpan={4} className="text-right">Total</TableCell>
              <TableCell className="text-right">
                RD$ {purchase.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
