import axios from "axios";
import { getPortalToken, clearPortalToken } from "./portalAuth";

const portalApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

portalApi.interceptors.request.use((config) => {
  const token = getPortalToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

portalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes("/api/portal/auth/");
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      typeof window !== "undefined"
    ) {
      clearPortalToken();
      const slug = window.location.pathname.split("/")[2] ?? "";
      window.location.href = `/portal/${slug}/login`;
    }
    return Promise.reject(error);
  }
);

export default portalApi;
