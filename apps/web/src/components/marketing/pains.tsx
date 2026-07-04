import { CarFront, FileWarning, HandCoins } from "lucide-react";

const PAINS = [
  {
    icon: FileWarning,
    text: "Órdenes en papelitos que se pierden y nadie sabe qué le toca a cada mecánico.",
  },
  {
    icon: CarFront,
    text: 'Un cliente reclama un rayón "que el carro no tenía" y usted termina pagando.',
  },
  {
    icon: HandCoins,
    text: "Le deben plata y ni usted se acuerda de quién ni cuánto.",
  },
] as const;

export function Pains() {
  return (
    <section className="border-b border-border bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          ¿Le pasa esto en su taller?
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-14 lg:gap-6">
          {PAINS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm shadow-black/20 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-opacity duration-300 group-hover:opacity-80">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-pretty text-base text-foreground/90">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
