"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomers, useCreateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import { CustomerForm, type CustomerFormValues } from "@/components/customers/CustomerForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ClientesPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useCustomers(q, page);
  const createMutation = useCreateCustomer();
  const deleteMutation = useDeleteCustomer();

  const customers = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  async function handleCreate(values: CustomerFormValues) {
    await createMutation.mutateAsync(values);
    setShowCreate(false);
  }

  const columns: ResponsiveColumn<(typeof customers)[number]>[] = [
    { header: "Nombre", primary: true, cell: (c) => c.full_name },
    { header: "Cédula / RNC", cell: (c) => c.document_id ?? "—" },
    { header: "Teléfono", cell: (c) => c.phone ?? "—" },
    { header: "Correo", cell: (c) => c.email ?? "—" },
    {
      header: "",
      isAction: true,
      className: "w-24",
      cell: (c) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar a ${c.full_name}?`)) {
              deleteMutation.mutate(c.id);
            }
          }}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Clientes"
        description={`${total} registros`}
        actions={
          <Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
            + Nuevo cliente
          </Button>
        }
      />

      <Input
        placeholder="Buscar por nombre o cédula..."
        value={q}
        onChange={(e) => { setQ(e.target.value); setPage(0); }}
        className="max-w-sm"
      />

      <ResponsiveList
        items={customers}
        columns={columns}
        getKey={(c) => c.id}
        onRowClick={(c) => router.push(`/clientes/${c.id}`)}
        isLoading={isLoading}
        emptyMessage="Sin resultados"
      />

      {totalPages > 1 && (
        <div className="flex gap-2 items-center justify-end text-sm">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            ← Anterior
          </Button>
          <span className="text-muted-foreground">Página {page + 1} de {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Siguiente →
          </Button>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
          </DialogHeader>
          <CustomerForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
