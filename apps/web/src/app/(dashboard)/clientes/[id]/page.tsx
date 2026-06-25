"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Car, Plus } from "lucide-react";
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import { useCustomerVehicles } from "@/hooks/useVehicles";
import { CustomerForm, customerToFormValues, type CustomerFormValues } from "@/components/customers/CustomerForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const { data, isLoading, isError } = useCustomer(id);
  const vehiclesQuery = useCustomerVehicles(id);
  const updateMutation = useUpdateCustomer(id);
  const deleteMutation = useDeleteCustomer();

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;
  if (isError || !data?.data) return <p className="text-sm text-destructive">Cliente no encontrado.</p>;

  const c = data.data;
  const vehicles = vehiclesQuery.data?.data ?? [];

  async function handleUpdate(values: CustomerFormValues) {
    await updateMutation.mutateAsync(values);
    setShowEdit(false);
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar a ${c.full_name}? Esta acción no se puede deshacer.`)) return;
    await deleteMutation.mutateAsync(c.id);
    router.push("/clientes");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/clientes")}
            className="text-sm text-muted-foreground hover:text-muted-foreground mb-1 block"
          >
            ← Clientes
          </button>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">{c.full_name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEdit(true)}>Editar</Button>
          <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información de contacto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Detail label="Cédula / RNC" value={c.document_id} />
          <Detail label="Teléfono" value={c.phone} />
          <Detail label="WhatsApp" value={c.whatsapp} />
          <Detail label="Correo" value={c.email} />
          <Detail label="Dirección" value={c.address} className="col-span-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            Vehículos
            {vehicles.length > 0 && (
              <span className="ml-2 nums text-sm font-normal text-muted-foreground">
                ({vehicles.length})
              </span>
            )}
          </CardTitle>
          <Link
            href={`/vehiculos?customerId=${c.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="h-4 w-4" /> Registrar
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {vehiclesQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Car className="h-5 w-5" />
              </span>
              <p className="text-sm text-muted-foreground">
                Este cliente aún no tiene vehículos registrados.
              </p>
            </div>
          ) : (
            <ul className="-mx-2 divide-y divide-border">
              {vehicles.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/vehiculos/${v.id}`}
                    className="group flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
                      <Car className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {v.brand} {v.model}
                        <span className="ml-1.5 text-muted-foreground">
                          {v.year}
                        </span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {v.license_plate ? (
                          <span className="nums">{v.license_plate}</span>
                        ) : (
                          "Sin placa"
                        )}
                        {v.color ? ` · ${v.color}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <CustomerForm
            defaultValues={customerToFormValues(c)}
            onSubmit={handleUpdate}
            submitLabel="Actualizar"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium text-foreground">{value ?? "—"}</p>
    </div>
  );
}
