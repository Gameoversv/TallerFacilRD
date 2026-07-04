import Link from "next/link";

import { Button } from "@/components/ui/button";

import { MARKETING } from "./constants";

const STEPS = [
  {
    number: "01",
    title: "Regístrese gratis",
    text: "15 días de prueba, sin tarjeta.",
  },
  {
    number: "02",
    title: "Configure su taller en menos de 30 minutos",
    text: "Sus mecánicos, sus servicios y los carros que tenga adentro ahora.",
  },
  {
    number: "03",
    title: "Opere desde donde sea",
    text: "Celular o computadora. Corre en la nube.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Arranque hoy mismo
        </h2>

        <div className="relative mt-10 grid gap-8 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-6 hidden h-px bg-border lg:block"
          />

          {STEPS.map(({ number, title, text }) => (
            <div key={number} className="relative flex flex-col gap-3">
              <span className="font-mono text-4xl font-bold text-primary">
                {number}
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-pretty text-base text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-2 lg:mt-16">
          <Button asChild size="lg">
            <Link href={MARKETING.registerHref}>
              {MARKETING.ctaPrimaryLabel}
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Sin tarjeta de crédito.
          </p>
        </div>
      </div>
    </section>
  );
}
