import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "@/data/site";
import { cn } from "@/lib/utils";
import { ExternalBookingButton } from "./ExternalBookingButton";
import { MobileMenu } from "./MobileMenu";
import { Wordmark } from "./Wordmark";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href="#servicios"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-[4px] focus:bg-acid focus:px-4 focus:py-2 focus:text-sm focus:text-acid-foreground"
      >
        Saltar al contenido
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled
            ? "border-b border-border bg-background/90 backdrop-blur-md"
            : "border-b border-transparent bg-gradient-to-b from-background/75 to-transparent backdrop-blur-[2px]",
        )}
      >
        <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-6 px-5 md:px-8">
          <a href="#top" aria-label="Fidelis Studio, ir al inicio" className="shrink-0">
            <Wordmark size="md" />
          </a>

          <nav aria-label="Navegación principal" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-xs tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <ExternalBookingButton size="sm" className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-border text-foreground transition-colors hover:border-acid hover:text-acid lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}