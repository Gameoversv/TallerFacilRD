import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  WorkOrder,
  WorkOrderStatus,
  WorkOrdersPage,
  CreateWorkOrderRequest,
  AddWorkOrderItemRequest,
} from "@/types/work-order";

export function useWorkOrders(status?: WorkOrderStatus | null, page = 0) {
  return useQuery<WorkOrdersPage>({
    queryKey: ["work-orders", status, page],
    queryFn: async () => {
      const res = await api.get("/api/work-orders", {
        params: { status: status ?? undefined, page, size: 20 },
      });
      return res.data;
    },
  });
}

export function useWorkOrder(id: string) {
  return useQuery<{ data: WorkOrder }>({
    queryKey: ["work-orders", id],
    queryFn: async () => {
      const res = await api.get(`/api/work-orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useWorkOrderByReception(receptionId: string) {
  return useQuery<{ data: WorkOrder }>({
    queryKey: ["work-orders", "reception", receptionId],
    queryFn: async () => {
      const res = await api.get(`/api/work-orders/by-reception/${receptionId}`);
      return res.data;
    },
    enabled: !!receptionId,
    retry: false,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkOrderRequest) =>
      api.post("/api/work-orders", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders"] }),
  });
}

export function useUpdateWorkOrderStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: WorkOrderStatus) =>
      api.patch(`/api/work-orders/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders"] }),
  });
}

export function useAddWorkOrderItem(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddWorkOrderItemRequest) =>
      api.post(`/api/work-orders/${orderId}/items`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders", orderId] }),
  });
}

export function useRemoveWorkOrderItem(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      api.delete(`/api/work-orders/${orderId}/items/${itemId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders", orderId] }),
  });
}
