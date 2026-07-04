import Link from "next/link";

import { Button } from "@/components/ui/button";

import { MARKETING } from "./constants";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-texture opacity-[0.06]"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
        <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Le configuramos su taller hoy mismo. ¿Arrancamos?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-background/70 sm:text-lg">
          Empiece con los carros que tiene adentro ahora.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full bg-background text-foreground shadow-none hover:bg-background/85 sm:w-auto"
          >
            <Link href={MARKETING.registerHref}>
              {MARKETING.ctaPrimaryLabel}
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background sm:w-auto"
          >
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
    </section>
  );
}
