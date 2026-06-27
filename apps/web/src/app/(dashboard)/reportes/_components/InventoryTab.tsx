/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useInventoryReport } from "@/hooks/useReports";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function fmt(n: number) {
  return "RD$ " + Number(n ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 });
}

export function InventoryTab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data, isLoading } = useInventoryReport();

  function exportCsv() {
    if (!data) return;
    const rows = data.low_stock_items.map((p) =>
      `${p.internal_code},"${p.description}",${p.current_stock},${p.min_stock}`);
    const csv = ["Código,Descripción,Stock actual,Stock mínimo", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "inventario-bajo.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Valor total del inventario", value: fmt(data?.total_inventory_value ?? 0) },
          { label: "Productos activos", value: String(data?.total_products ?? 0) },
          { label: "Bajo stock", value: String(data?.low_stock_count ?? 0), warn: (data?.low_stock_count ?? 0) > 0 },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            {isLoading ? <Skeleton className="mt-2 h-7 w-28" /> : (
              <p className={`mt-1 font-display text-xl font-bold ${k.warn ? "text-orange-400" : ""}`}>{k.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Top parts chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-4 text-sm font-medium">Top 10 piezas más usadas en OTs</p>
        {(!mounted || isLoading) ? <Skeleton className="h-56 w-full" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.top_used_parts ?? []} layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
              <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis type="category" dataKey="description" width={160} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              />
              <Bar dataKey="times_used" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Low stock table */}
      {((data?.low_stock_items?.length ?? 0) > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">Productos bajo stock mínimo</p>
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-orange-400/20">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-orange-400/5">
                <tr>
                  {["Código", "Descripción", "Stock actual", "Stock mínimo"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.low_stock_items.map((p) => (
                  <tr key={p.internal_code} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{p.internal_code}</td>
                    <td className="px-4 py-3">{p.description}</td>
                    <td className="px-4 py-3 font-bold text-orange-400">{p.current_stock}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.min_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
