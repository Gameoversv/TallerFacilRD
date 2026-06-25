import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Employee, EmployeeRequest } from "@/types/employee";

interface EmployeesPage {
  data: Employee[];
  meta: { total: number; page: number; limit: number };
}

export function useEmployees(role?: string, active?: boolean, page = 0) {
  const params = new URLSearchParams({ page: String(page), size: "20" });
  if (role) params.set("role", role);
  if (active !== undefined) params.set("active", String(active));

  return useQuery<EmployeesPage>({
    queryKey: ["employees", role, active, page],
    queryFn: async () => {
      const res = await api.get(`/api/employees?${params}`);
      return res.data;
    },
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeRequest) =>
      api.post("/api/employees", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeRequest) =>
      api.put(`/api/employees/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useToggleEmployeeActive(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/api/employees/${id}/toggle-active`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}
