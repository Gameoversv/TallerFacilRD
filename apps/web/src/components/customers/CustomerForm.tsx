"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/types/customer";

const schema = z.object({
  firstName: z.string().min(1, "Requerido").max(100),
  lastName: z.string().min(1, "Requerido").max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  documentId: z.string().max(20).optional().or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<CustomerFormValues>;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  submitLabel?: string;
}

export function CustomerForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Nombre *</Label>
          <Input {...register("firstName")} placeholder="Juan" />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Apellido *</Label>
          <Input {...register("lastName")} placeholder="Pérez" />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Teléfono</Label>
          <Input {...register("phone")} placeholder="809-000-0000" />
        </div>
        <div className="space-y-1">
          <Label>WhatsApp</Label>
          <Input {...register("whatsapp")} placeholder="809-000-0000" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Correo</Label>
        <Input {...register("email")} type="email" placeholder="cliente@mail.com" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Dirección</Label>
        <Input {...register("address")} placeholder="Calle 1, Santo Domingo" />
      </div>
      <div className="space-y-1">
        <Label>Cédula / RNC</Label>
        <Input {...register("documentId")} placeholder="000-0000000-0" />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}

export function customerToFormValues(c: Customer): CustomerFormValues {
  return {
    firstName: c.first_name,
    lastName: c.last_name,
    phone: c.phone ?? "",
    whatsapp: c.whatsapp ?? "",
    email: c.email ?? "",
    address: c.address ?? "",
    documentId: c.document_id ?? "",
  };
}
