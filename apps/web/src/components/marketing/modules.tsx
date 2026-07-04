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

const MODULES = [
  {
    icon: Camera,
    title: "Recepción con foto y firma",
    pain: '"Mi carro entró sin ese rayón"',
    pitch: "Checklist, fotos y firma al entrar. Cero pleitos.",
  },
  {
    icon: ClipboardList,
    title: "Órdenes de trabajo",
    pain: "Papelitos perdidos",
    pitch: "Todo en pantalla, asignado a cada mecánico, con estado.",
  },
  {
    icon: History,
    title: "Diagnóstico e historial",
    pain: '"¿Qué le hicimos a ese carro la otra vez?"',
    pitch: "Timeline completo por vehículo.",
  },
  {
    icon: FileCheck,
    title: "Cotizaciones aprobadas",
    pain: '"Yo no autoricé eso"',
    pitch: "El cliente aprueba antes. Respaldo para usted.",
  },
  {
    icon: Receipt,
    title: "Facturación con ITBIS",
    pain: "Factura a mano, con errores",
    pitch: "Numeración automática, ITBIS y PDF listo.",
  },
  {
    icon: Wallet,
    title: "Cuentas por cobrar",
    pain: '"¿Quién me debe?"',
    pitch: "Deudores claros y pagos parciales al día.",
  },
  {
    icon: PiggyBank,
    title: "Caja",
    pain: "Plata que desaparece",
    pitch: "Ingresos, egresos y balance diario.",
  },
  {
    icon: Package,
    title: "Inventario con alertas",
    pain: "Se acaba la pieza sin avisar",
    pitch: "Alerta automática de stock mínimo.",
  },
  {
    icon: Truck,
    title: "Compras y proveedores",
    pain: "Gastos sin control",
    pitch: "Historial de compras y el stock sube solo.",
  },
  {
    icon: BellRing,
    title: "Recordatorios",
    pain: "El cliente no vuelve",
    pitch: "Aviso de mantenimiento por tiempo o kilometraje.",
  },
  {
    icon: Smartphone,
    title: "Portal del cliente",
    pain: 'El teléfono no para: "¿ya está mi carro?"',
    pitch: "El cliente ve el estado solo. Menos llamadas.",
  },
  {
    icon: BarChart3,
    title: "Dashboard y reportes",
    pain: "¿Estoy ganando o perdiendo?",
    pitch: "Ventas, productividad y KPIs en vivo.",
  },
] as const;

export function Modules() {
  return (
    <section id="funciones" className="border-b border-border bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Todo su taller en un solo sistema
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
          {MODULES.map(({ icon: Icon, title, pain, pitch }) => (
            <div
              key={title}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-primary/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-opacity duration-300 group-hover:opacity-80">
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
      </div>
    </section>
  );
}
