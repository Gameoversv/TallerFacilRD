"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const SalesTab = dynamic(() => import("./_components/SalesTab").then((m) => ({ default: m.SalesTab })), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});
const InventoryTab = dynamic(() => import("./_components/InventoryTab").then((m) => ({ default: m.InventoryTab })), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});
const MechanicsTab = dynamic(() => import("./_components/MechanicsTab").then((m) => ({ default: m.MechanicsTab })), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});

const TABS = [
  { id: "sales", label: "Ventas" },
  { id: "inventory", label: "Inventario" },
  { id: "mechanics", label: "Mecánicos" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ReportesPage() {
  const [tab, setTab] = useState<TabId>("sales");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-sm text-muted-foreground">Análisis de ventas, inventario y productividad</p>
      </div>

      <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sales" && <SalesTab />}
      {tab === "inventory" && <InventoryTab />}
      {tab === "mechanics" && <MechanicsTab />}
    </div>
  );
}
