import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Invoice, InvoicesPage, CreateInvoiceRequest } from "@/types/invoice";

export function useInvoices(page = 0) {
  return useQuery<InvoicesPage>({
    queryKey: ["invoices", page],
    queryFn: async () => {
      const res = await api.get(`/api/invoices?page=${page}&size=20`);
      return res.data;
    },
  });
}

export function useInvoice(id: string) {
  return useQuery<{ data: Invoice }>({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const res = await api.get(`/api/invoices/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) =>
      api.post("/api/invoices", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoiceStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) =>
      api.patch(`/api/invoices/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}
