/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useSalesReport } from "@/hooks/useReports";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function today() { return new Date().toISOString().slice(0, 10); }
function monthStart() { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); }

function fmt(n: number) {
  return "RD$ " + Number(n ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 });
}

export function SalesTab() {
  const [from, setFrom] = useState("2026-06-01");
  const [to, setTo] = useState("2026-06-27");
  const [groupBy, setGroupBy] = useState("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFrom(monthStart());
    setTo(today());
    setMounted(true);
  }, []);
  const { data, isLoading } = useSalesReport(from, to, groupBy);

  const change = data && data.previous_revenue > 0
    ? ((data.total_revenue - data.previous_revenue) / data.previous_revenue) * 100
    : null;

  function exportCsv() {
    if (!data?.trend) return;
    const rows = data.trend.map((r) => `${r.label},${r.revenue},${r.invoice_count}`);
    const csv = ["Fecha,Ingresos,Facturas", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ventas.csv"; a.click();
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
        <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
          {(["day", "week", "month"] as const).map((g) => (
            <button key={g} onClick={() => setGroupBy(g)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${groupBy === g ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {g === "day" ? "Día" : g === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="ml-auto gap-2">
          <Download className="h-4 w-4" /> CSV
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard label="Ingresos totales" value={fmt(data?.total_revenue ?? 0)} isLoading={isLoading}
          sub={change !== null ? (
            <span className={`flex items-center gap-0.5 text-xs ${change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {Math.abs(change).toFixed(1)}% vs período anterior
            </span>
          ) : null} />
        <KpiCard label="Facturas pagadas" value={String(data?.total_invoices ?? 0)} isLoading={isLoading} />
        <KpiCard label="Ticket promedio" value={fmt(data?.avg_ticket ?? 0)} isLoading={isLoading} />
        <KpiCard label="OTs completadas" value={String(data?.completed_work_orders ?? 0)} isLoading={isLoading} />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-4 text-sm font-medium">Tendencia de ingresos</p>
        {(!mounted || isLoading) ? <Skeleton className="h-64 w-full" /> : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.trend ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground"
                tickFormatter={(v) => "RD$" + Number(v).toLocaleString("es-DO")} width={80} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))"
                fill="url(#grad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, isLoading, sub }: {
  label: string; value: string; isLoading: boolean; sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      {isLoading ? <Skeleton className="mt-2 h-7 w-28" /> : (
        <>
          <p className="mt-1 font-display text-xl font-bold">{value}</p>
          {sub}
        </>
      )}
    </div>
  );
}
