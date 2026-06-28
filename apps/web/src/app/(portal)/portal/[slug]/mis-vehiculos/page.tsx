"use client";

import { use } from "react";
import Link from "next/link";
import { Car, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import portalApi from "@/lib/portalApi";

interface PortalVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  color: string | null;
  mileage: number | null;
}

function usePortalVehicles() {
  return useQuery({
    queryKey: ["portal", "vehicles"],
    queryFn: async () => {
      const res = await portalApi.get<{ data: PortalVehicle[] }>("/api/portal/vehicles");
      return res.data.data;
    },
  });
}

export default function PortalVehiclesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: vehicles, isLoading, isError } = usePortalVehicles();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">Error cargando vehículos.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Mis Vehículos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona un vehículo para ver su historial y OTs.
        </p>
      </div>

      {vehicles && vehicles.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
          <Car className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No tienes vehículos registrados.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {vehicles?.map((v) => (
            <li key={v.id}>
              <Link
                href={`/portal/${slug}/mis-vehiculos/${v.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40 hover:bg-card/80"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Car className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {v.brand} {v.model}{" "}
                    <span className="font-normal text-muted-foreground">
                      {v.year}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {v.license_plate ?? "Sin placa"}
                    {v.color ? ` · ${v.color}` : ""}
                    {v.mileage ? ` · ${v.mileage.toLocaleString()} km` : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
