import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MARKETING } from "./constants";

const BULLETS = [
  "Todos los módulos, sin límites",
  "Usuarios ilimitados",
  "Soporte y configuración inicial incluidos",
  "Sin contrato de permanencia",
] as const;

export function Pricing() {
  return (
    <section
      id="precio"
      className="relative overflow-hidden border-b border-border bg-muted"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[20rem] bg-[radial-gradient(50%_45%_at_50%_100%,color-mix(in_oklch,var(--color-warning)_12%,transparent),transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Un solo plan. Todo incluido.
        </h2>

        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/30 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl font-bold tracking-tight text-warning sm:text-6xl">
                {MARKETING.priceMonthly}
              </span>
              <span className="text-base text-muted-foreground">
                /mes por taller
              </span>
            </div>

            <p className="mt-4 text-pretty text-sm text-muted-foreground">
              Menos de {MARKETING.pricePerDay} al día — un solo reclamo
              evitado lo paga.
            </p>
          </div>

          <ul className="mt-8 flex flex-col gap-3">
            {BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="text-pretty text-base text-foreground/90">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center gap-2">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={MARKETING.registerHref}>
                {MARKETING.ctaPrimaryLabel}
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Sin tarjeta de crédito.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
