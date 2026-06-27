"use client";

import { useState } from "react";
import { useAuditLog } from "@/hooks/useSuperAdmin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ACTION_LABELS: Record<string, string> = {
  APPROVE: "Aprobado",
  STATUS_CHANGE: "Cambio de estado",
  PLAN_CHANGE: "Cambio de plan",
  EXTEND_TRIAL: "Trial extendido",
  IMPERSONATE: "Impersonación",
};

const ACTION_COLORS: Record<string, string> = {
  APPROVE: "text-emerald-400",
  STATUS_CHANGE: "text-amber-400",
  PLAN_CHANGE: "text-blue-400",
  EXTEND_TRIAL: "text-violet-400",
  IMPERSONATE: "text-orange-400",
};

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAuditLog(undefined, page);

  const actions = data?.data?.content ?? [];
  const total = data?.data?.total_elements ?? 0;
  const totalPages = Math.ceil(total / 30);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">GarageFlow HQ</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">{total} acciones registradas</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {["Acción", "Detalle", "Actor", "Taller ID", "Fecha"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                ))}</tr>
              ))
              : actions.length === 0
                ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Sin acciones registradas</td></tr>
                : actions.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${ACTION_COLORS[a.action] ?? "text-foreground"}`}>
                        {ACTION_LABELS[a.action] ?? a.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.detail ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.actor_email}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {a.tenant_id ? a.tenant_id.slice(0, 8) + "…" : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString("es-DO")}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
          </div>
        </div>
      )}
    </div>
  );
}
