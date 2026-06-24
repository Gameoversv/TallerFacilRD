"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import { CustomerForm, customerToFormValues, type CustomerFormValues } from "@/components/customers/CustomerForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const { data, isLoading, isError } = useCustomer(id);
  const updateMutation = useUpdateCustomer(id);
  const deleteMutation = useDeleteCustomer();

  if (isLoading) return <p className="text-sm text-gray-400">Cargando...</p>;
  if (isError || !data?.data) return <p className="text-sm text-red-500">Cliente no encontrado.</p>;

  const c = data.data;

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
            className="text-sm text-gray-400 hover:text-gray-600 mb-1 block"
          >
            ← Clientes
          </button>
          <h1 className="text-2xl font-bold">{c.full_name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEdit(true)}>Editar</Button>
          <Button variant="ghost" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
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
        <CardHeader>
          <CardTitle className="text-base">Historial</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-400 text-center py-6">
          Vehículos, órdenes y gastos disponibles en próximas fases.
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
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-800">{value ?? "—"}</p>
    </div>
  );
}
