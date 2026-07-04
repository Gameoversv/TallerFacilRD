const MONEY_PUNCHES = [
  {
    number: "01",
    title: "Deje de perder plata en reclamos",
    text: 'Foto y firma digital del cliente al recibir el vehículo. Si el rayón ya estaba, queda documentado. Cero pleitos.',
  },
  {
    number: "02",
    title: "Cobre lo que le deben",
    text: "Cuentas por cobrar con pagos parciales y lista clara de deudores. Nadie se le pierde.",
  },
  {
    number: "03",
    title: "Haga que el cliente vuelva",
    text: 'Recordatorios automáticos por tiempo o kilometraje: "le toca el cambio de aceite". Recompra sola.',
  },
] as const;

export function MoneyPunches() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(55%_45%_at_50%_0%,color-mix(in_oklch,var(--color-warning)_14%,transparent),transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Tres formas en que WorkshopTrack le devuelve la plata
        </h2>

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {MONEY_PUNCHES.map(({ number, title, text }) => (
            <div
              key={number}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-lg shadow-black/30 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-warning/40"
            >
              <span className="font-mono text-4xl font-bold text-warning transition-opacity duration-300 group-hover:opacity-80">
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
      </div>
    </section>
  );
}
