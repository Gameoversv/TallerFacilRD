const PORTAL_TOKEN_KEY = "portal_token";

export function getPortalToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PORTAL_TOKEN_KEY);
}

export function setPortalToken(token: string): void {
  localStorage.setItem(PORTAL_TOKEN_KEY, token);
}

export function clearPortalToken(): void {
  localStorage.removeItem(PORTAL_TOKEN_KEY);
}

export function getPortalUser(): {
  id: string;
  name: string;
  customerId: string;
  tenantId: string;
} | null {
  const token = getPortalToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub,
      name: payload.name,
      customerId: payload.customerId,
      tenantId: payload.tenantId,
    };
  } catch {
    return null;
  }
}

export function isPortalAuthenticated(): boolean {
  return getPortalToken() !== null;
}
