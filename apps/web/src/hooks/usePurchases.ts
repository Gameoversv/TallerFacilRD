import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Supplier,
  Purchase,
  PurchasesPage,
  CreateSupplierRequest,
  CreatePurchaseRequest,
} from "@/types/purchase";

export function useSuppliers() {
  return useQuery<{ data: Supplier[] }>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await api.get("/api/suppliers");
      return res.data;
    },
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierRequest) =>
      api.post("/api/suppliers", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/suppliers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function usePurchases(page = 0) {
  return useQuery<PurchasesPage>({
    queryKey: ["purchases", page],
    queryFn: async () => {
      const res = await api.get(`/api/purchases?page=${page}&size=20`);
      return res.data;
    },
  });
}

export function usePurchase(id: string) {
  return useQuery<{ data: Purchase }>({
    queryKey: ["purchases", id],
    queryFn: async () => {
      const res = await api.get(`/api/purchases/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePurchaseRequest) =>
      api.post("/api/purchases", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
