import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Customer, CreateCustomerRequest, CustomersPage } from "@/types/customer";

export function useCustomers(q: string, page: number) {
  return useQuery<CustomersPage>({
    queryKey: ["customers", q, page],
    queryFn: async () => {
      const res = await api.get("/api/customers", { params: { q, page, size: 20 } });
      return res.data;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<{ data: Customer }>({
    queryKey: ["customers", id],
    queryFn: async () => {
      const res = await api.get(`/api/customers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) =>
      api.post("/api/customers", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateCustomerRequest>) =>
      api.put(`/api/customers/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}
