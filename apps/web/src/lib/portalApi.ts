import axios from "axios";
import { getPortalToken, clearPortalToken } from "./portalAuth";

function toSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
        toSnakeCase(v),
      ])
    );
  }
  return obj;
}

const portalApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

portalApi.interceptors.request.use((config) => {
  const token = getPortalToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data && typeof config.data === "object") {
    config.data = toSnakeCase(config.data);
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
