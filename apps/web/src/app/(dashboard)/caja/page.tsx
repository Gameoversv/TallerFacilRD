"use client";

import { useState } from "react";
import { useCashTransactions, useCashBalance, useCreateCashTransaction } from "@/hooks/useCash";
import { Button } from "@/components/ui/button";
import type { TransactionType } from "@/types/cash";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Caja</h1>
          <p className="text-sm text-gray-500">Control de ingresos y egresos</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "+ Nueva transacción"}
        </Button>
      </div>

      {/* Date range filter */}
      <div className="flex gap-3 items-center text-sm">
        <label className="text-gray-500">Desde</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
        <label className="text-gray-500">Hasta</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-green-50 border-green-100 p-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Ingresos</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {balance ? fmt(balance.total_ingresos) : "—"}
          </p>
        </div>
        <div className="rounded-lg border bg-red-50 border-red-100 p-4">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Egresos</p>
          <p className="text-2xl font-bold text-red-700 mt-1">
            {balance ? fmt(balance.total_egresos) : "—"}
          </p>
        </div>
        <div className={`rounded-lg border p-4 ${balance && balance.balance >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${balance && balance.balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance && balance.balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            {balance ? fmt(balance.balance) : "—"}
          </p>
        </div>
      </div>

      {/* New transaction form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-5 space-y-4">
          <p className="font-medium text-gray-800">Nueva transacción</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Tipo</label>
              <select value={type} onChange={(e) => { setType(e.target.value as TransactionType); setCategory(""); }}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400">
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Monto (RD$)</label>
              <input type="number" step="0.01" min="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                required />
            </div>
            <div>
              <label className="text-xs text-gray-500">Descripción</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                required />
            </div>
            <div>
              <label className="text-xs text-gray-500">Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400">
                <option value="">Sin categoría</option>
                {CATEGORIES[type].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Fecha</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                required />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" disabled={createTx.isPending}>
            {createTx.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      )}

      {/* Transaction list */}
      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-gray-400">Sin transacciones en el período seleccionado</p>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Categoría</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(tx.transaction_date).toLocaleDateString("es-DO")}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      tx.type === "INGRESO"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {tx.type === "INGRESO" ? "Ingreso" : "Egreso"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{tx.category ?? "—"}</td>
                  <td className="px-4 py-2">{tx.description}</td>
                  <td className={`px-4 py-2 text-right font-semibold ${
                    tx.type === "INGRESO" ? "text-green-700" : "text-red-700"
                  }`}>
                    {tx.type === "EGRESO" ? "-" : ""}RD$ {tx.amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
