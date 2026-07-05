"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isPortalAuthenticated, clearPortalToken, getPortalUser } from "@/lib/portalAuth";

export default function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (!isPortalAuthenticated()) {
      router.replace(`/portal/${slug}/login`);
    }
  }, [router, slug]);

  function handleLogout() {
    clearPortalToken();
    router.push(`/portal/${slug}/login`);
  }

  const user = getPortalUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="print:hidden border-b border-border bg-card px-4 py-4 flex flex-wrap items-center justify-between gap-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
            T
          </div>
          <span className="font-semibold text-foreground">Portal del Cliente</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground">{user.name}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="print:hidden border-b border-border bg-card/50 overflow-x-auto">
        <div className="mx-auto flex max-w-5xl gap-6 px-6 whitespace-nowrap">
          <a
            href={`/portal/${slug}/mis-vehiculos`}
            className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary transition-colors"
          >
            Mis Vehículos
          </a>
          <a
            href={`/portal/${slug}/mis-facturas`}
            className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary transition-colors"
          >
            Mis Facturas
          </a>
          <a
            href={`/portal/${slug}/mi-cuenta`}
            className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary transition-colors"
          >
            Mi Cuenta
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
