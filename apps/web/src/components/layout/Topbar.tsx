"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { findNavItem, navGroups } from "@/components/layout/nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const pathname = usePathname();
  const current = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 print:hidden">
      {/* Mobile: brand + menu */}
      <div className="flex items-center gap-2 md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Abrir menú"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            {navGroups.map((group) => (
              <div key={group.label}>
                <DropdownMenuLabel className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {group.label}
                </DropdownMenuLabel>
                {group.items.map((item) => {
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
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Logo collapsed />
      </div>

      {/* Breadcrumb / page context */}
      <div className="hidden min-w-0 flex-col md:flex">
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          GarageFlow
        </span>
        <span className="truncate font-display text-sm font-semibold text-white">
          {current?.label ?? "Panel"}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2.5">
        {/* Search */}
        <div className="hidden w-full max-w-xs sm:block">
          <GlobalSearch />
        </div>

        {/* Notifications */}
        <button
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-white"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
        </button>

        {/* Status */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-success/25 bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
          En línea
        </div>
      </div>
    </header>
  );
}
