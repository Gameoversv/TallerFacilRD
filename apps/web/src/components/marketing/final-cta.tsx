import Link from "next/link";

import { Button } from "@/components/ui/button";

import { MARKETING } from "./constants";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(60%_55%_at_50%_0%,color-mix(in_oklch,var(--color-primary)_22%,transparent),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-texture opacity-[0.05]"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="glow-primary surface-glass rounded-3xl px-6 py-14 text-center sm:px-14 sm:py-16">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Le configuramos su taller hoy mismo. ¿Arrancamos?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Empiece con los carros que tiene adentro ahora.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={MARKETING.registerHref}>
                {MARKETING.ctaPrimaryLabel}
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
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
      </div>
    </section>
  );
}
