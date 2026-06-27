/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useMechanicsReport } from "@/hooks/useReports";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function today() { return new Date().toISOString().slice(0, 10); }
function monthAgo() { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); }
function fmt(n: number) { return "RD$ " + Number(n ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 }); }

export function MechanicsTab() {
  const [from, setFrom] = useState("2026-05-27");
  const [to, setTo] = useState("2026-06-27");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFrom(monthAgo());
    setTo(today());
    setMounted(true);
  }, []);
  const { data, isLoading } = useMechanicsReport(from, to);
  const mechanics = data?.mechanics ?? [];

  function exportCsv() {
    const rows = mechanics.map((m) =>
      `"${m.mechanic_name}",${m.completed_ots},${m.cancelled_ots},${m.total_revenue},${m.avg_completion_hours?.toFixed(1) ?? ""}`);
    const csv = ["Mecánico,OTs completadas,OTs canceladas,Ingresos generados,Horas promedio", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "mecanicos.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Desde</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Hasta</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="ml-auto gap-2" disabled={mechanics.length === 0}>
          <Download className="h-4 w-4" /> CSV
        </Button>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-4 text-sm font-medium">OTs por mecánico</p>
        {(!mounted || isLoading) ? <Skeleton className="h-56 w-full" /> : mechanics.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Sin datos para el período</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mechanics} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="mechanic_name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="completed_ots" name="Completadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled_ots" name="Canceladas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Table */}
      {mechanics.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Mecánico", "OTs completadas", "OTs canceladas", "Ingresos generados", "Horas prom. por OT"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  ))}</tr>
                ))
                : mechanics.map((m) => (
                  <tr key={m.mechanic_name} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{m.mechanic_name}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{m.completed_ots}</td>
                    <td className="px-4 py-3 text-rose-400">{m.cancelled_ots}</td>
                    <td className="px-4 py-3">{fmt(m.total_revenue)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.avg_completion_hours != null ? `${m.avg_completion_hours.toFixed(1)}h` : "—"}
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
