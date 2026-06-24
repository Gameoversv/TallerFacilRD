import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardSummary, ActivityEvent, AlertItem } from "@/types/dashboard";

const REFETCH_INTERVAL = 60_000;

export function useDashboardSummary() {
  return useQuery<{ data: DashboardSummary }>({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.get("/api/dashboard/summary").then((r) => r.data),
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useDashboardActivity() {
  return useQuery<{ data: ActivityEvent[] }>({
    queryKey: ["dashboard", "activity"],
    queryFn: () => api.get("/api/dashboard/activity").then((r) => r.data),
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useDashboardAlerts() {
  return useQuery<{ data: AlertItem[] }>({
    queryKey: ["dashboard", "alerts"],
    queryFn: () => api.get("/api/dashboard/alerts").then((r) => r.data),
    refetchInterval: REFETCH_INTERVAL,
  });
}
