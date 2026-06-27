"use client";

import { useRouter } from "next/navigation";
import { Shield, X } from "lucide-react";

const IMPERSONATE_KEY = "token_superadmin";

export function isImpersonating(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(IMPERSONATE_KEY);
}

export function startImpersonation(impersonationToken: string): void {
  const current = localStorage.getItem("token");
  if (current) localStorage.setItem(IMPERSONATE_KEY, current);
  localStorage.setItem("token", impersonationToken);
}

export function stopImpersonation(): void {
  const original = localStorage.getItem(IMPERSONATE_KEY);
  if (original) {
    localStorage.setItem("token", original);
    localStorage.removeItem(IMPERSONATE_KEY);
  }
}

export default function ImpersonationBanner() {
  const router = useRouter();

  if (!isImpersonating()) return null;

  function handleExit() {
    stopImpersonation();
    router.push("/super-admin/talleres");
  }

  return (
    <div className="flex items-center justify-between bg-amber-500 px-4 py-2 text-sm font-medium text-black">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        <span>Modo impersonación activo — estás viendo este taller como administrador</span>
      </div>
      <button
        onClick={handleExit}
        className="flex items-center gap-1 rounded-md border border-black/20 px-2 py-0.5 text-xs hover:bg-black/10"
      >
        <X className="h-3 w-3" />
        Salir
      </button>
    </div>
  );
}
