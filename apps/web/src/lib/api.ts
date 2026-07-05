import axios from "axios";

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

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data && typeof config.data === "object") {
    config.data = toSnakeCase(config.data);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes("/api/auth/");
    if (!isAuthEndpoint && typeof window !== "undefined") {
      const serverError =
        (error.response?.data as { error?: string } | undefined)?.error ?? "";
      // Tenant suspended/cancelled: the backend cuts the session mid-flight
      // (JwtAuthFilter → 403 "Taller suspendido"). Log out and surface why.
      const suspended = status === 403 && /suspendido/i.test(serverError);
      if (status === 401 || suspended) {
        localStorage.removeItem("token");
        window.location.href = suspended ? "/login?suspended=1" : "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
