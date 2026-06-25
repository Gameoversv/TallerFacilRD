import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Payment, CreatePaymentRequest } from "@/types/payment";

export function useInvoicePayments(invoiceId: string) {
  return useQuery<{ data: Payment[] }>({
    queryKey: ["payments", invoiceId],
    queryFn: async () => {
      const res = await api.get(`/api/invoices/${invoiceId}/payments`);
      return res.data;
    },
    enabled: !!invoiceId,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentRequest) =>
      api.post("/api/payments", data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["payments", variables.invoiceId] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
