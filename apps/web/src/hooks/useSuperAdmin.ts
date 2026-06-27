import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface GlobalStats {
  tenants_total: number;
  tenants_trial: number;
  tenants_active: number;
  tenants_suspended: number;
  tenants_cancelled: number;
  users_total: number;
  customers_total: number;
  vehicles_total: number;
  work_orders_total: number;
}

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  plan: "STARTER" | "PRO" | "ENTERPRISE";
  status: "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
  trial_ends_at: string | null;
  created_at: string;
  user_count: number;
  customer_count: number;
  vehicle_count: number;
  order_count: number;
}

export function useSuperAdminStats() {
  return useQuery<{ data: GlobalStats }>({
    queryKey: ["super-admin", "stats"],
    queryFn: () => api.get("/api/super-admin/stats").then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useSuperAdminTenants(q?: string, page = 0) {
  return useQuery<{ data: { content: TenantSummary[]; total_elements: number } }>({
    queryKey: ["super-admin", "tenants", q, page],
    queryFn: () =>
      api
        .get("/api/super-admin/tenants", { params: { q: q || undefined, page } })
        .then((r) => r.data),
  });
}

export function useUpdateTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TenantSummary["status"] }) =>
      api.patch(`/api/super-admin/tenants/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin"] }),
  });
}

export function useUpdateTenantPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: TenantSummary["plan"] }) =>
      api.patch(`/api/super-admin/tenants/${id}/plan`, { plan }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin"] }),
  });
}
