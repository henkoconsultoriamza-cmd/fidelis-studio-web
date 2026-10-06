import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { NAV_LINKS, CONTACT } from "@/data/site";
import { ExternalBookingButton } from "./ExternalBookingButton";
import { Wordmark } from "./Wordmark";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/70"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="relative ml-auto flex h-full w-full max-w-sm flex-col border-l border-border bg-surface px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex items-start justify-between">
          <Wordmark size="md" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="-mr-2 flex h-12 w-12 items-center justify-center rounded-[4px] border border-border text-foreground transition-colors hover:border-acid hover:text-acid"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Navegación principal móvil" className="mt-10 flex-1">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link, index) => (
              <li key={link.href} className="border-b border-border">
                <a
                  href={link.href}
                  onClick={onClose}
                  className="flex items-baseline gap-4 py-4 transition-colors hover:text-acid focus-visible:text-acid"
                >
                  <span className="label-tech w-6">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-display text-3xl">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 space-y-4">
          <ExternalBookingButton size="lg" className="w-full" />
          <p className="label-tech">{CONTACT.note}</p>
        </div>
      </div>
    </div>
  );
}