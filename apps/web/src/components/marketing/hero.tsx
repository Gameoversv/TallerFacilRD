import Link from "next/link";

import { Button } from "@/components/ui/button";

import { MARKETING } from "./constants";

const KPIS = [
  { label: "Vendido hoy", value: "RD$18,450", tone: "default" },
  { label: "Carros en taller", value: "7", tone: "default" },
  { label: "Por cobrar", value: "RD$32,900", tone: "warning" },
] as const;

const ORDERS = [
  { plate: "A123456", client: "J. Pérez", status: "En proceso" },
  { plate: "G789012", client: "M. Ramírez", status: "Listo" },
  { plate: "L345678", client: "R. Fernández", status: "Esperando pieza" },
] as const;

const STATUS_STYLES: Record<(typeof ORDERS)[number]["status"], string> = {
  "En proceso": "bg-primary/15 text-primary",
  Listo: "bg-success/15 text-success",
  "Esperando pieza": "bg-warning/15 text-warning",
};

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--color-primary)_18%,transparent),transparent)]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-24 lg:px-8">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Software para talleres automotrices · República Dominicana
          </p>

          <h1 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            ¿Cuánto pierde al mes en reclamos falsos y clientes que no pagan?
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">
            WorkshopTrack controla su taller completo — recepción con foto y
            firma, órdenes de trabajo, facturación y cuentas por cobrar —
            desde el celular o la computadora.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={MARKETING.registerHref}>
                  {MARKETING.ctaPrimaryLabel}
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Sin tarjeta de crédito.
              </p>
            </div>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a
                href={MARKETING.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {MARKETING.ctaSecondaryLabel}
              </a>
            </Button>
          </div>
        </div>

        <div className="relative lg:justify-self-end">
          <div
            aria-hidden="true"
            className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl"
          />

          <div
            role="img"
            aria-label="Panel de control de WorkshopTrack mostrando ventas del día, carros en taller, cuentas por cobrar y órdenes de trabajo recientes"
            className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl shadow-black/40 sm:max-w-lg"
          >
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-3 text-xs font-medium text-muted-foreground">
                Panel — WorkshopTrack
              </span>
            </div>

            <div className="grid grid-cols-3 gap-px border-b border-border bg-border">
              {KPIS.map((kpi) => (
                <div key={kpi.label} className="flex flex-col gap-1 bg-card px-3 py-4">
                  <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                    {kpi.label}
                  </span>
                  <span
                    className={
                      "font-mono text-sm font-semibold sm:text-base " +
                      (kpi.tone === "warning" ? "text-warning" : "text-foreground")
                    }
                  >
                    {kpi.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 p-4">
              {ORDERS.map((order) => (
                <div
                  key={order.plate}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-foreground">
                      {order.plate}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.client}
                    </span>
                  </div>
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-[0.65rem] font-medium " +
                      STATUS_STYLES[order.status]
                    }
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
