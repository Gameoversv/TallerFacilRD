"use client";

import { useState } from "react";
import { useInvoicePayments, useCreatePayment } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/types/payment";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  CHEQUE: "Cheque",
};

interface Props {
  invoiceId: string;
  total: number;
  paidAmount: number;
  remainingBalance: number;
  status: string;
}

export default function PaymentSection({ invoiceId, total, paidAmount, remainingBalance, status }: Props) {
  const { data, isLoading } = useInvoicePayments(invoiceId);
  const createPayment = useCreatePayment();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("EFECTIVO");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const payments = data?.data ?? [];
  const canPay = status === "PENDIENTE";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) { setError("Monto inválido"); return; }
    if (parsed > remainingBalance) { setError(`Monto excede saldo pendiente (RD$ ${remainingBalance.toLocaleString("es-DO", { minimumFractionDigits: 2 })})`); return; }

    try {
      await createPayment.mutateAsync({
        invoiceId,
        amount: parsed,
        paymentDate: date,
        paymentMethod: method,
        notes: notes || undefined,
      });
      setAmount("");
      setNotes("");
    } catch {
      setError("Error al registrar pago");
    }
  }

  return (
    <div className="space-y-4">
      {/* Balance summary */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-md bg-muted/40 border p-3 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Total factura</p>
          <p className="font-semibold">RD$ {total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-md bg-success/10 border border-success/20 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Pagado</p>
          <p className="font-semibold text-success">RD$ {paidAmount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className={`rounded-md border p-3 text-center ${remainingBalance > 0 ? "bg-warning/10 border-warning/20" : "bg-muted/40"}`}>
          <p className="text-xs text-muted-foreground mb-0.5">Pendiente</p>
          <p className={`font-semibold ${remainingBalance > 0 ? "text-warning" : "text-muted-foreground"}`}>
            RD$ {remainingBalance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Payment history */}
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Cargando pagos...</p>
      ) : payments.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Método</th>
                <th className="px-3 py-2">Notas</th>
                <th className="px-3 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2">{new Date(p.payment_date).toLocaleDateString("es-DO")}</td>
                  <td className="px-3 py-2">{METHOD_LABEL[p.payment_method]}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{p.notes ?? "—"}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    RD$ {p.amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
      )}

      {/* New payment form */}
      {canPay && remainingBalance > 0 && (
        <form onSubmit={handleSubmit} className="border rounded-md p-4 space-y-3 bg-muted/40">
          <p className="text-sm font-medium text-foreground">Registrar pago</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Monto (RD$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={remainingBalance.toFixed(2)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Método</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {(Object.keys(METHOD_LABEL) as PaymentMethod[]).map((m) => (
                  <option key={m} value={m}>{METHOD_LABEL[m]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notas (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={createPayment.isPending}>
            {createPayment.isPending ? "Registrando..." : "Registrar pago"}
          </Button>
        </form>
      )}
    </div>
  );
}
