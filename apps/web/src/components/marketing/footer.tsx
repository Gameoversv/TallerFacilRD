import Link from "next/link";

import { Logo } from "@/components/brand/Logo";

import { MARKETING } from "./constants";

const FOOTER_LINKS = [
  { href: MARKETING.loginHref, label: "Entrar" },
  { href: MARKETING.portalHref, label: "Portal del cliente" },
  { href: MARKETING.registerHref, label: "Prueba gratis" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex max-w-sm flex-col gap-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Control total de su taller, desde el celular.
            </p>
          </div>

          <nav
            aria-label="Enlaces de pie de página"
            className="flex flex-col gap-3"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={MARKETING.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {MARKETING.whatsappDisplay}
            </a>
          </nav>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} WorkshopTrack
        </p>
      </div>
    </footer>
  );
}
