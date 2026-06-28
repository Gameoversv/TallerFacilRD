import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Reception, ReceptionChecklist } from "@/types/reception";

export interface CreateReceptionRequest {
  vehicle_id: string;
  entry_km: number;
  reported_problem: string;
  checklist: ReceptionChecklist;
  notes?: string;
}

export interface ReceptionsPage {
  data: Reception[];
  meta: { total: number; page: number; limit: number };
}

export function useReceptions(page = 0) {
  return useQuery<ReceptionsPage>({
    queryKey: ["receptions", "list", page],
    queryFn: async () => {
      const res = await api.get(`/api/receptions?page=${page}`);
      return res.data;
    },
  });
}

export function useReception(id: string) {
  return useQuery<{ data: Reception }>({
    queryKey: ["receptions", id],
    queryFn: async () => {
      const res = await api.get(`/api/receptions/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useVehicleReceptions(vehicleId: string) {
  return useQuery<{ data: Reception[] }>({
    queryKey: ["receptions", "vehicle", vehicleId],
    queryFn: async () => {
      const res = await api.get(`/api/vehicles/${vehicleId}/receptions`);
      return res.data;
    },
    enabled: !!vehicleId,
  });
}

export function useCreateReception() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReceptionRequest) =>
      api.post("/api/receptions", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["receptions"] }),
  });
}

export function useAddReceptionPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const form = new FormData();
      form.append("file", file);
      return api
        .post(`/api/receptions/${id}/photos`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["receptions", vars.id] }),
  });
}

export function useAddReceptionSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, signatureData }: { id: string; signatureData: string }) =>
      api
        .put(`/api/receptions/${id}/signature`, { signature_data: signatureData })
        .then((r) => r.data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["receptions", vars.id] }),
  });
}
