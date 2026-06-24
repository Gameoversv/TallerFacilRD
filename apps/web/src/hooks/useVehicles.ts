import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Vehicle, CreateVehicleRequest, VehiclesPage } from "@/types/vehicle";

export function useVehicles(customerId: string | null, q: string, page: number) {
  return useQuery<VehiclesPage>({
    queryKey: ["vehicles", customerId, q, page],
    queryFn: async () => {
      const res = await api.get("/api/vehicles", {
        params: { customerId: customerId ?? undefined, q, page, size: 20 },
      });
      return res.data;
    },
  });
}

export function useVehicle(id: string) {
  return useQuery<{ data: Vehicle }>({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      const res = await api.get(`/api/vehicles/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCustomerVehicles(customerId: string) {
  return useQuery<{ data: Vehicle[] }>({
    queryKey: ["vehicles", "customer", customerId],
    queryFn: async () => {
      const res = await api.get(`/api/customers/${customerId}/vehicles`);
      return res.data;
    },
    enabled: !!customerId,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehicleRequest) =>
      api.post("/api/vehicles", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useUpdateVehicle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateVehicleRequest>) =>
      api.put(`/api/vehicles/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/vehicles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}
