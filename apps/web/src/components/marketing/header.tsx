import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

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
        <a href="#inicio" className="shrink-0">
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
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={MARKETING.loginHref}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
