import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) =>
      api.post("/api/users/me/password", body).then((r) => r.data),
  });
}
