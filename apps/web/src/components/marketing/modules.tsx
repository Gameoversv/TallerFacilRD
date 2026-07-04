import {
  BarChart3,
  BellRing,
  Camera,
  ClipboardList,
  FileCheck,
  History,
  Package,
  PiggyBank,
  Receipt,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";

const FEATURED_MODULES = [
  {
    icon: Camera,
    title: "Recepción con foto y firma",
    pain: '"Mi carro entró sin ese rayón"',
    pitch: "Checklist, fotos y firma al entrar. Cero pleitos.",
  },
  {
    icon: Receipt,
    title: "Facturación con ITBIS",
    pain: "Factura a mano, con errores",
    pitch: "Numeración automática, ITBIS y PDF listo.",
  },
  {
    icon: BarChart3,
    title: "Dashboard y reportes",
    pain: "¿Estoy ganando o perdiendo?",
    pitch: "Ventas, productividad y KPIs en vivo.",
  },
] as const;

const COMPACT_MODULES = [
  {
    icon: ClipboardList,
    title: "Órdenes de trabajo",
    pitch: "Todo en pantalla, asignado a cada mecánico.",
  },
  {
    icon: History,
    title: "Diagnóstico e historial",
    pitch: "Timeline completo por vehículo.",
  },
  {
    icon: FileCheck,
    title: "Cotizaciones aprobadas",
    pitch: "El cliente aprueba antes de que usted repare.",
  },
  {
    icon: Wallet,
    title: "Cuentas por cobrar",
    pitch: "Deudores claros y pagos parciales al día.",
  },
  {
    icon: PiggyBank,
    title: "Caja",
    pitch: "Ingresos, egresos y balance diario.",
  },
  {
    icon: Package,
    title: "Inventario con alertas",
    pitch: "Alerta automática de stock mínimo.",
  },
  {
    icon: Truck,
    title: "Compras y proveedores",
    pitch: "Historial de compras y el stock sube solo.",
  },
  {
    icon: BellRing,
    title: "Recordatorios",
    pitch: "Aviso de mantenimiento por tiempo o kilometraje.",
  },
  {
    icon: Smartphone,
    title: "Portal del cliente",
    pitch: "El cliente ve el estado solo. Menos llamadas.",
  },
] as const;

export function Modules() {
  return (
    <section id="funciones" className="border-b border-border bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Todo su taller en un solo sistema
        </h2>

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3">
          {FEATURED_MODULES.map(({ icon: Icon, title, pain, pitch }) => (
            <div
              key={title}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-card p-7 shadow-lg shadow-black/30 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-primary/60"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
              />
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm font-medium italic text-warning">
                {pain}
              </p>
              <p className="text-pretty text-sm text-muted-foreground">
                {pitch}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:mt-14">
          Y también incluye
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPACT_MODULES.map(({ icon: Icon, title, pitch }) => (
            <div
              key={title}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-opacity duration-300 group-hover:opacity-80">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-pretty text-xs text-muted-foreground">
                  {pitch}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
