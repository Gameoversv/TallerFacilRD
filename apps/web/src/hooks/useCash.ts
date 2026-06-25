import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { CashTransaction, CashBalance, CreateCashTransactionRequest } from "@/types/cash";

interface TransactionsPage {
  data: CashTransaction[];
  meta: { total: number; page: number; limit: number };
}

export function useCashTransactions(from: string, to: string, page = 0) {
  return useQuery<TransactionsPage>({
    queryKey: ["cash", "transactions", from, to, page],
    queryFn: async () => {
      const res = await api.get(`/api/cash/transactions?from=${from}&to=${to}&page=${page}&size=50`);
      return res.data;
    },
  });
}

export function useCashBalance(from: string, to: string) {
  return useQuery<{ data: CashBalance }>({
    queryKey: ["cash", "balance", from, to],
    queryFn: async () => {
      const res = await api.get(`/api/cash/balance?from=${from}&to=${to}`);
      return res.data;
    },
  });
}

export function useCreateCashTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCashTransactionRequest) =>
      api.post("/api/cash/transactions", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash"] }),
  });
}
