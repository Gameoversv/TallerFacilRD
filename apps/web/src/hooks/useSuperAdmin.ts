import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface GlobalStats {
  tenants_total: number;
  tenants_pending: number;
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
  status: "PENDING" | "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
  trial_ends_at: string | null;
  created_at: string;
  user_count: number;
  customer_count: number;
  vehicle_count: number;
  order_count: number;
}

export interface TenantDetail extends TenantSummary {
  city: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  rnc: string | null;
  owners: UserSummary[];
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant_id: string | null;
  active: boolean;
  created_at: string;
}

export interface ExpiringTenant {
  id: string;
  name: string;
  slug: string;
  trial_ends_at: string;
}

export interface AdminAction {
  id: string;
  actor_email: string;
  action: string;
  tenant_id: string | null;
  detail: string | null;
  created_at: string;
}

// ── Stats ──────────────────────────────────────────────────────────────────

export function useSuperAdminStats() {
  return useQuery<{ data: GlobalStats }>({
    queryKey: ["super-admin", "stats"],
    queryFn: () => api.get("/api/super-admin/stats").then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useExpiringTrials() {
  return useQuery<{ data: ExpiringTenant[] }>({
    queryKey: ["super-admin", "expiring-trials"],
    queryFn: () => api.get("/api/super-admin/stats/expiring-trials").then((r) => r.data),
  });
}

export function useRecentTenants() {
  return useQuery<{ data: TenantSummary[] }>({
    queryKey: ["super-admin", "recent-tenants"],
    queryFn: () => api.get("/api/super-admin/stats/recent-tenants").then((r) => r.data),
  });
}

// ── Tenants ────────────────────────────────────────────────────────────────

export function useSuperAdminTenants(status?: string, page = 0) {
  return useQuery<{ data: { content: TenantSummary[]; total_elements: number } }>({
    queryKey: ["super-admin", "tenants", status, page],
    queryFn: () =>
      api
        .get("/api/super-admin/tenants", { params: { status: status || undefined, page } })
        .then((r) => r.data),
  });
}

export function useTenantDetail(id: string | null) {
  return useQuery<{ data: TenantDetail }>({
    queryKey: ["super-admin", "tenant", id],
    queryFn: () => api.get(`/api/super-admin/tenants/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useApproveTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/api/super-admin/tenants/${id}/approve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin"] }),
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

export function useExtendTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, days }: { id: string; days?: number }) =>
      api
        .post(`/api/super-admin/tenants/${id}/extend-trial`, null, { params: { days: days ?? 30 } })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin"] }),
  });
}

export function useImpersonate() {
  return useMutation({
    mutationFn: (id: string) =>
      api
        .post<{ data: { token: string; tenant_name: string } }>(`/api/super-admin/tenants/${id}/impersonate`)
        .then((r) => r.data.data),
  });
}

// ── Users ──────────────────────────────────────────────────────────────────

export function useUserSearch(email: string, page = 0) {
  return useQuery<{ data: { content: UserSummary[]; total_elements: number } }>({
    queryKey: ["super-admin", "users", email, page],
    queryFn: () =>
      api.get("/api/super-admin/users", { params: { email, page } }).then((r) => r.data),
    enabled: email.length >= 2,
  });
}

// ── Audit log ──────────────────────────────────────────────────────────────

export function useAuditLog(tenantId?: string, page = 0) {
  return useQuery<{ data: { content: AdminAction[]; total_elements: number } }>({
    queryKey: ["super-admin", "audit", tenantId, page],
    queryFn: () =>
      api
        .get("/api/super-admin/audit", { params: { tenantId: tenantId || undefined, page } })
        .then((r) => r.data),
  });
}
