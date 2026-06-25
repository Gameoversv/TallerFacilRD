import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { VehicleHistory } from "@/types/vehicleHistory";

export function useVehicleHistory(vehicleId: string) {
  return useQuery<{ data: VehicleHistory }>({
    queryKey: ["vehicle-history", vehicleId],
    queryFn: async () => {
      const res = await api.get(`/api/vehicles/${vehicleId}/history`);
      return res.data;
    },
    enabled: !!vehicleId,
  });
}
