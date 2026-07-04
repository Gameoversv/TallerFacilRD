import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

import { MARKETING } from "./constants";

const ANCHOR_LINKS = [
  { href: "#funciones", label: "Funciones" },
  { href: "#precio", label: "Precio" },
  { href: "#preguntas", label: "Preguntas" },
] as const;

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <a
          href="#inicio"
          className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="sm:hidden">
            <Logo collapsed />
          </span>
          <span className="hidden sm:block">
            <Logo />
          </span>
        </a>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-8 md:flex"
        >
          {ANCHOR_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Abrir menú"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {ANCHOR_LINKS.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <a href={link.href}>{link.label}</a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={MARKETING.loginHref}
            className="rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Entrar
          </Link>
          <Button asChild size="sm">
            <Link href={MARKETING.registerHref}>
              <span className="sm:hidden">Prueba gratis</span>
              <span className="hidden sm:inline">
                {MARKETING.ctaPrimaryLabel}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
