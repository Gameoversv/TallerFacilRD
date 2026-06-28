"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileText, ChevronRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import portalApi from "@/lib/portalApi";

interface PortalInvoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  status: string;
  total: number;
  vehicle_label: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PAGADA: {
    label: "Pagada",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-success",
  },
  PENDIENTE: {
    label: "Pendiente",
    icon: <Clock className="h-4 w-4" />,
    color: "text-warning",
  },
  ANULADA: {
    label: "Anulada",
    icon: <XCircle className="h-4 w-4" />,
    color: "text-muted-foreground",
  },
};

function usePortalInvoices() {
  return useQuery({
    queryKey: ["portal", "invoices"],
    queryFn: async () => {
      const res = await portalApi.get<{ data: PortalInvoice[] }>("/api/portal/invoices");
      return res.data.data;
    },
  });
}

export default function PortalInvoicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: invoices, isLoading, isError } = usePortalInvoices();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Error cargando facturas.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Mis Facturas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de facturas de tus vehículos.
        </p>
      </div>

      {invoices && invoices.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No tienes facturas.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {invoices?.map((inv) => {
            const cfg = STATUS_CONFIG[inv.status];
            return (
              <li key={inv.id}>
                <Link
                  href={`/portal/${slug}/mis-facturas/${inv.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40 hover:bg-card/80"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="nums font-semibold text-foreground">
                        {inv.invoice_number}
                      </p>
                      {cfg && (
                        <span className={`flex items-center gap-1 text-xs ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {inv.vehicle_label} ·{" "}
                      {new Date(inv.issue_date).toLocaleDateString("es-DO")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="nums text-sm font-semibold text-foreground">
                      RD${" "}
                      {Number(inv.total).toLocaleString("es-DO", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
