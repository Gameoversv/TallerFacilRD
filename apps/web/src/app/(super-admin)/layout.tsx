"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getUser, isAuthenticated, clearToken } from "@/lib/auth";
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Shield,
  Users,
  ScrollText,
  Menu,
  Megaphone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/super-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/super-admin/talleres", icon: Building2, label: "Talleres" },
  { href: "/super-admin/usuarios", icon: Users, label: "Usuarios" },
  { href: "/super-admin/anuncio", icon: Megaphone, label: "Anuncio" },
  { href: "/super-admin/audit", icon: ScrollText, label: "Audit Log" },
] as const;

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

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
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              WorkshopTrack HQ
            </p>
            <p className="text-[10px] text-muted-foreground">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar with collapsible menu */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur-xl md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Abrir menú"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="gap-2.5">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                className="gap-2.5 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              WorkshopTrack HQ
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
