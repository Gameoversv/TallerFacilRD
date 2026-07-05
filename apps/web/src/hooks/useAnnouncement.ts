import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Announcement } from "@/hooks/useSuperAdmin";

export function useAnnouncement() {
  return useQuery<{ data: Announcement | null }>({
    queryKey: ["announcement"],
    queryFn: () => api.get("/api/announcement").then((r) => r.data),
  });
}
