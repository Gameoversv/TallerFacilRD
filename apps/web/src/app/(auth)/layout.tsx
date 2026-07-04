import { LogoMark } from "@/components/brand/Logo";
import { Car, Gauge, ShieldCheck } from "lucide-react";

const highlights = [
  {
    icon: Gauge,
    title: "Operación en tiempo real",
    text: "Órdenes, diagnósticos y caja sincronizados al instante.",
  },
  {
    icon: Car,
    title: "Historial por vehículo",
    text: "Cada placa con su ficha completa de servicios y repuestos.",
  },
  {
    icon: ShieldCheck,
    title: "Datos protegidos",
    text: "Roles, permisos y respaldo para tu taller.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-12 lg:flex">
        <div className="grid-texture pointer-events-none absolute inset-0 opacity-50" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(0,163,255,0.22), transparent)" }}
        />

        <div className="relative flex items-center gap-3">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Workshop<span className="text-primary">Track</span>
          </span>
        </div>

        <div className="relative space-y-8">
          <h2 className="max-w-md font-display text-4xl font-bold leading-[1.1] tracking-tight text-white">
            El sistema operativo de tu{" "}
            <span className="text-gradient">taller mecánico</span>.
          </h2>
          <ul className="space-y-5">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <li key={h.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-white">{h.title}</p>
                    <p className="text-sm text-muted-foreground">{h.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} WorkshopTrack · Hecho para talleres de RD
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}
