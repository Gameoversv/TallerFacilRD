import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Quote, CreateQuoteRequest } from "@/types/quote";

export function useWorkOrderQuotes(workOrderId: string) {
  return useQuery<{ data: Quote[] }>({
    queryKey: ["quotes", workOrderId],
    queryFn: async () => {
      const res = await api.get(`/api/work-orders/${workOrderId}/quotes`);
      return res.data;
    },
    enabled: !!workOrderId,
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuoteRequest) =>
      api.post("/api/quotes", data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["quotes", variables.workOrderId] });
    },
  });
}

export function useUpdateQuoteStatus(quoteId: string, workOrderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) =>
      api.patch(`/api/quotes/${quoteId}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes", workOrderId] });
    },
  });
}
