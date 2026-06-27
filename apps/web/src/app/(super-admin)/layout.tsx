"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, isAuthenticated, clearToken } from "@/lib/auth";
import { LayoutDashboard, Building2, LogOut, Shield } from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const user = getUser();
    if (user?.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              GarageFlow HQ
            </p>
            <p className="text-[10px] text-muted-foreground">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          <NavItem href="/super-admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/super-admin/talleres" icon={Building2} label="Talleres" />
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
