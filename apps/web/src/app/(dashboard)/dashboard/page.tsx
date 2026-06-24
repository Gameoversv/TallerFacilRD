import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Órdenes activas", value: "—", icon: "🔧" },
  { label: "Vehículos hoy", value: "—", icon: "🚗" },
  { label: "Clientes registrados", value: "—", icon: "👥" },
  { label: "Facturación del mes", value: "—", icon: "💰" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen del taller · hoy
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <span>{s.icon}</span>
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-400">
        Los módulos de datos estarán disponibles en próximas fases.
      </div>
    </div>
  );
}
