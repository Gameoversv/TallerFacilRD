import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type ReminderType =
  | "OIL_CHANGE"
  | "BRAKE_SERVICE"
  | "COOLANT_CHANGE"
  | "TIMING_BELT"
  | "ALIGNMENT_BALANCE"
  | "GENERAL_INSPECTION"
  | "OTHER";

export type ReminderStatus = "UPCOMING" | "DUE_SOON" | "OVERDUE" | "COMPLETED";

export interface Reminder {
  id: string;
  vehicle_id: string;
  vehicle_label: string;
  license_plate: string | null;
  type: ReminderType;
  custom_label: string | null;
  last_service_km: number | null;
  last_service_at: string | null;
  interval_km: number | null;
  interval_days: number | null;
  next_km: number | null;
  next_date: string | null;
  status: ReminderStatus;
  notes: string | null;
}

export interface CreateReminderPayload {
  vehicle_id: string;
  type: ReminderType;
  custom_label?: string;
  last_service_km?: number;
  last_service_at?: string;
  interval_km?: number;
  interval_days?: number;
  notes?: string;
}

export function useReminders(vehicleId?: string) {
  return useQuery<Reminder[]>({
    queryKey: ["reminders", vehicleId ?? "all"],
    queryFn: async () => {
      const params = vehicleId ? `?vehicleId=${vehicleId}` : "";
      const res = await api.get(`/api/reminders${params}`);
      return res.data;
    },
  });
}

export function useDueSoonReminders() {
  return useQuery<Reminder[]>({
    queryKey: ["reminders", "due-soon"],
    queryFn: async () => {
      const res = await api.get("/api/reminders/due-soon");
      return res.data;
    },
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateReminderPayload) => {
      const res = await api.post("/api/reminders", payload);
      return res.data as Reminder;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useCompleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, currentKm }: { id: string; currentKm?: number }) => {
      const params = currentKm != null ? `?currentKm=${currentKm}` : "";
      const res = await api.post(`/api/reminders/${id}/complete${params}`);
      return res.data as Reminder;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/reminders/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}
