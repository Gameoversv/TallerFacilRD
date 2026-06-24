"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomers, useCreateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import { CustomerForm, type CustomerFormValues } from "@/components/customers/CustomerForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-gray-500">{total} registros</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Nuevo cliente</Button>
      </div>

      <Input
        placeholder="Buscar por nombre o cédula..."
        value={q}
        onChange={(e) => { setQ(e.target.value); setPage(0); }}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula / RNC</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                    Sin resultados
                  </TableCell>
                </TableRow>
              )}
              {customers.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/clientes/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.full_name}</TableCell>
                  <TableCell>{c.document_id ?? "—"}</TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar a ${c.full_name}?`)) {
                          deleteMutation.mutate(c.id);
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 items-center justify-end text-sm">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            ← Anterior
          </Button>
          <span className="text-gray-500">Página {page + 1} de {totalPages}</span>
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
