import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, X, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin-session";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/admin", label: "Resumen" },
  { to: "/admin/general", label: "Datos generales" },
  { to: "/admin/servicios", label: "Servicios" },
  { to: "/admin/equipo", label: "Equipo" },
  { to: "/admin/galeria", label: "Galería" },
  { to: "/admin/horarios", label: "Horarios" },
  { to: "/admin/testimonios", label: "Testimonios" },
  { to: "/admin/promociones", label: "Promociones" },
  { to: "/admin/secciones", label: "Secciones y reservas" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useAdminSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const links = profile?.esHenko ? [...LINKS, { to: "/admin/usuarios", label: "Usuarios" }] : LINKS;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-border transition-colors hover:border-acid hover:text-acid lg:hidden"
            >
              {open ? <Menu className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="font-display text-lg">
              Panel<span className="text-acid">.</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-11 items-center gap-2 rounded-[4px] border border-border px-4 text-xs tracking-[0.12em] uppercase transition-colors hover:border-acid hover:text-acid sm:inline-flex"
            >
              Ver web <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-border px-4 text-xs tracking-[0.12em] uppercase transition-colors hover:border-acid hover:text-acid"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] gap-8 px-4 py-8 md:px-8">
        <aside
          className={cn(
            "fixed inset-0 z-50 bg-background/95 p-6 backdrop-blur-md lg:static lg:z-auto lg:block lg:w-60 lg:shrink-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none",
            open ? "block" : "hidden",
          )}
        >
          <div className="mb-6 flex justify-end lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-border"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Secciones del panel">
            <ul className="space-y-1">
              {links.map((link) => {
                const active =
                  link.to === "/admin" ? pathname === "/admin" : pathname.startsWith(link.to);
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-11 items-center rounded-[4px] px-3 text-sm transition-colors",
                        active
                          ? "bg-elevated text-acid"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {profile ? (
            <p className="mt-8 text-xs text-muted-foreground">
              {profile.nombre ?? profile.email}
              <br />
              <span className="label-tech">{profile.esHenko ? "Henko admin" : "Administrador"}</span>
            </p>
          ) : null}
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)]">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}