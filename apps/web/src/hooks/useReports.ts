import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface SalesTrendEntry {
  label: string;
  revenue: number;
  invoice_count: number;
}

export interface SalesSummaryResponse {
  total_revenue: number;
  previous_revenue: number;
  total_invoices: number;
  avg_ticket: number;
  completed_work_orders: number;
  trend: SalesTrendEntry[];
}

export interface TopProductEntry {
  description: string;
  times_used: number;
  total_amount: number;
}

export interface LowStockEntry {
  internal_code: string;
  description: string;
  current_stock: number;
  min_stock: number;
}

export interface InventoryReportResponse {
  total_inventory_value: number;
  total_products: number;
  low_stock_count: number;
  top_used_parts: TopProductEntry[];
  low_stock_items: LowStockEntry[];
}

export interface MechanicProductivityEntry {
  mechanic_name: string;
  completed_ots: number;
  cancelled_ots: number;
  total_revenue: number;
  avg_completion_hours: number | null;
}

export interface MechanicsReportResponse {
  mechanics: MechanicProductivityEntry[];
}

export function useSalesReport(from: string, to: string, groupBy: string) {
  return useQuery({
    queryKey: ["reports", "sales", from, to, groupBy],
    queryFn: () => api.get("/api/reports/sales", { params: { from, to, group_by: groupBy } }).then((r) => r.data.data as SalesSummaryResponse),
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ["reports", "inventory"],
    queryFn: () => api.get("/api/reports/inventory").then((r) => r.data.data as InventoryReportResponse),
  });
}

export function useMechanicsReport(from: string, to: string) {
  return useQuery({
    queryKey: ["reports", "mechanics", from, to],
    queryFn: () => api.get("/api/reports/mechanics", { params: { from, to } }).then((r) => r.data.data as MechanicsReportResponse),
  });
}
