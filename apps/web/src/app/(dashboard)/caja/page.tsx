"use client";

import { useState } from "react";
import { useCashTransactions, useCashBalance, useCreateCashTransaction } from "@/hooks/useCash";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";
import type { CashTransaction, TransactionType } from "@/types/cash";

const today = new Date().toISOString().split("T")[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .split("T")[0];

const CATEGORIES: Record<TransactionType, string[]> = {
  INGRESO: ["Pago de factura", "Adelanto", "Otro ingreso"],
  EGRESO: ["Repuestos", "Suministros", "Servicios", "Nómina", "Renta", "Otros gastos"],
};

export default function CajaPage() {
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);

  const { data: balanceData } = useCashBalance(from, to);
  const { data: txData, isLoading } = useCashTransactions(from, to);
  const createTx = useCreateCashTransaction();

  const balance = balanceData?.data;
  const transactions = txData?.data ?? [];

  // Form state
  const [type, setType] = useState<TransactionType>("INGRESO");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(today);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) { setError("Monto inválido"); return; }
    if (!description.trim()) { setError("Descripción requerida"); return; }

    try {
      await createTx.mutateAsync({ type, amount: parsed, description, category: category || undefined, transactionDate: date });
      setAmount("");
      setDescription("");
      setCategory("");
      setShowForm(false);
    } catch {
      setError("Error al registrar transacción");
    }
  }

  const fmt = (n: number) => `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const columns: ResponsiveColumn<CashTransaction>[] = [
    {
      header: "Fecha",
      primary: true,
      cell: (tx) => new Date(tx.transaction_date).toLocaleDateString("es-DO"),
    },
    {
      header: "Tipo",
      cell: (tx) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          tx.type === "INGRESO"
            ? "bg-success/15 text-success"
            : "bg-destructive/15 text-destructive"
        }`}>
          {tx.type === "INGRESO" ? "Ingreso" : "Egreso"}
        </span>
      ),
    },
    { header: "Categoría", cell: (tx) => tx.category ?? "—" },
    { header: "Descripción", cell: (tx) => tx.description },
    {
      header: "Monto",
      className: "text-right",
      cell: (tx) => (
        <span className={tx.type === "INGRESO" ? "font-semibold text-success" : "font-semibold text-destructive"}>
          {tx.type === "EGRESO" ? "-" : ""}RD$ {tx.amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caja"
        description="Control de ingresos y egresos"
        actions={
          <Button onClick={() => setShowForm((v) => !v)} className="w-full sm:w-auto">
            {showForm ? "Cancelar" : "+ Nueva transacción"}
          </Button>
        }
      />

      {/* Date range filter */}
      <div className="flex flex-wrap gap-3 items-center text-sm">
        <label className="text-muted-foreground">Desde</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        <label className="text-muted-foreground">Hasta</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-success/10 border-success/20 p-4">
          <p className="text-xs font-semibold text-success uppercase tracking-wide">Ingresos</p>
          <p className="text-2xl font-bold text-success mt-1">
            {balance ? fmt(balance.total_ingresos) : "—"}
          </p>
        </div>
        <div className="rounded-lg border bg-destructive/10 border-destructive/20 p-4">
          <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Egresos</p>
          <p className="text-2xl font-bold text-destructive mt-1">
            {balance ? fmt(balance.total_egresos) : "—"}
          </p>
        </div>
        <div className={`rounded-lg border p-4 ${balance && balance.balance >= 0 ? "bg-primary/10 border-primary/20" : "bg-warning/10 border-warning/20"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${balance && balance.balance >= 0 ? "text-primary" : "text-warning"}`}>Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance && balance.balance >= 0 ? "text-primary" : "text-warning"}`}>
            {balance ? fmt(balance.balance) : "—"}
          </p>
        </div>
      </div>

      {/* New transaction form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-5 space-y-4">
          <p className="font-medium text-foreground">Nueva transacción</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Tipo</label>
              <select value={type} onChange={(e) => { setType(e.target.value as TransactionType); setCategory(""); }}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Monto (RD$)</label>
              <input type="number" step="0.01" min="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Descripción</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Sin categoría</option>
                {CATEGORIES[type].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fecha</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={createTx.isPending}>
            {createTx.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      )}

      {/* Transaction list */}
      <ResponsiveList
        items={transactions}
        columns={columns}
        getKey={(tx) => tx.id}
        isLoading={isLoading}
        emptyMessage="Sin transacciones en el período seleccionado"
      />
    </div>
  );
}
