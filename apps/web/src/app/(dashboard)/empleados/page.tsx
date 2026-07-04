"use client";

import { useState } from "react";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useToggleEmployeeActive } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveList, type ResponsiveColumn } from "@/components/layout/ResponsiveList";
import type { Employee, EmployeeRole, EmployeeRequest } from "@/types/employee";

const ROLE_LABEL: Record<EmployeeRole, string> = {
  OWNER: "Propietario",
  MANAGER: "Gerente",
  RECEPTIONIST: "Recepcionista",
  MECHANIC: "Mecánico",
  CLIENT: "Cliente",
};

const ROLE_COLOR: Record<EmployeeRole, string> = {
  OWNER: "bg-purple-100 text-purple-700",
  MANAGER: "bg-primary/15 text-primary",
  RECEPTIONIST: "bg-cyan-100 text-cyan-700",
  MECHANIC: "bg-warning/15 text-warning",
  CLIENT: "bg-muted text-muted-foreground",
};

const ROLES: EmployeeRole[] = ["OWNER", "MANAGER", "RECEPTIONIST", "MECHANIC"];

const EMPTY_FORM: EmployeeRequest = {
  firstName: "", lastName: "", phone: "", email: "",
  role: "MECHANIC", position: "", hireDate: "", salary: undefined,
};

export default function EmpleadosPage() {
  const [page, setPage] = useState(0);
  const [filterRole, setFilterRole] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const { data, isLoading } = useEmployees(
    filterRole || undefined,
    showInactive ? undefined : true,
    page
  );

  const createEmployee = useCreateEmployee();
  const [editingId, setEditingId] = useState<string | null>(null);
  const updateEmployee = useUpdateEmployee(editingId ?? "");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EmployeeRequest>(EMPTY_FORM);
  const [error, setError] = useState("");

  const employees = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(emp: Employee) {
    setEditingId(emp.id);
    setForm({
      firstName: emp.first_name,
      lastName: emp.last_name,
      phone: emp.phone ?? "",
      email: emp.email ?? "",
      role: emp.role,
      position: emp.position ?? "",
      hireDate: emp.hire_date ?? "",
      salary: emp.salary ?? undefined,
    });
    setError("");
    setShowForm(true);
  }

  function cancel() { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload: EmployeeRequest = {
      ...form,
      phone: form.phone || undefined,
      email: form.email || undefined,
      position: form.position || undefined,
      hireDate: form.hireDate || undefined,
    };
    try {
      if (editingId) await updateEmployee.mutateAsync(payload);
      else await createEmployee.mutateAsync(payload);
      cancel();
    } catch {
      setError("Error al guardar empleado");
    }
  }

  const f = (key: keyof EmployeeRequest, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const columns: ResponsiveColumn<Employee>[] = [
    {
      header: "Nombre",
      primary: true,
      cell: (emp) => (
        <span className={emp.active ? "" : "opacity-50"}>{emp.full_name}</span>
      ),
    },
    {
      header: "Rol",
      cell: (emp) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLOR[emp.role]}`}>
          {ROLE_LABEL[emp.role]}
        </span>
      ),
    },
    { header: "Cargo", cell: (emp) => emp.position ?? "—" },
    { header: "Teléfono", cell: (emp) => emp.phone ?? "—" },
    { header: "Email", cell: (emp) => emp.email ?? "—" },
    {
      header: "Estado",
      cell: (emp) => (
        <span className={`text-xs px-2 py-0.5 rounded-full ${emp.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
          {emp.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "",
      isAction: true,
      className: "w-28",
      cell: (emp) => <EmployeeActions emp={emp} onEdit={openEdit} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Empleados"
        description={`${total} registros`}
        actions={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            + Nuevo empleado
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 items-center text-sm flex-wrap">
        <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
          className="rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">Todos los roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
        <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          Mostrar inactivos
        </label>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-5 space-y-4">
          <p className="font-medium">{editingId ? "Editar empleado" : "Nuevo empleado"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["firstName", "lastName"] as const).map((field) => (
              <div key={field}>
                <label className="text-xs text-muted-foreground">{field === "firstName" ? "Nombre" : "Apellido"} *</label>
                <input value={form[field] as string} onChange={(e) => f(field, e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" required />
              </div>
            ))}
            <div>
              <label className="text-xs text-muted-foreground">Rol *</label>
              <select value={form.role} onChange={(e) => f("role", e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cargo / Especialidad</label>
              <input value={form.position ?? ""} onChange={(e) => f("position", e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Teléfono</label>
              <input value={form.phone ?? ""} onChange={(e) => f("phone", e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input type="email" value={form.email ?? ""} onChange={(e) => f("email", e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fecha contratación</label>
              <input type="date" value={form.hireDate ?? ""} onChange={(e) => f("hireDate", e.target.value)}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Salario (RD$)</label>
              <input type="number" step="0.01" min="0" value={form.salary ?? ""}
                onChange={(e) => f("salary", e.target.value ? parseFloat(e.target.value) : "")}
                className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={createEmployee.isPending || updateEmployee.isPending}>
              {editingId ? "Actualizar" : "Crear"}
            </Button>
            <Button type="button" variant="ghost" onClick={cancel}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* List */}
      <ResponsiveList
        items={employees}
        columns={columns}
        getKey={(emp) => emp.id}
        isLoading={isLoading}
        emptyMessage="Sin empleados registrados"
      />

      {totalPages > 1 && (
        <div className="flex gap-2 items-center justify-end text-sm">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
          <span className="text-muted-foreground">Página {page + 1} de {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Siguiente →</Button>
        </div>
      )}
    </div>
  );
}

function EmployeeActions({ emp, onEdit }: { emp: Employee; onEdit: (e: Employee) => void }) {
  const toggle = useToggleEmployeeActive(emp.id);
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={() => onEdit(emp)}>Editar</Button>
      <Button variant="ghost" size="sm" onClick={() => toggle.mutate()} disabled={toggle.isPending}
        className={emp.active ? "text-destructive hover:text-destructive" : "text-success hover:text-success"}>
        {emp.active ? "Desactivar" : "Activar"}
      </Button>
    </div>
  );
}
