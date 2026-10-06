import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, AdminPage } from "@/components/admin/AdminShell";
import { useAdminSession } from "@/hooks/use-admin-session";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de administraciÃ³n | Fidelis Studio" },
      {
        name: "description",
        content: "Panel privado para editar los contenidos de Fidelis Studio.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Panel de administraciÃ³n | Fidelis Studio" },
      {
        property: "og:description",
        content: "Panel privado para editar los contenidos de Fidelis Studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const navigate = useNavigate();
  const { session, loading, profile, isAdmin } = useAdminSession();

  // SesiÃ³n vencida o cerrada en otra pestaÃ±a: volvemos al login con aviso.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !next)) {
        void navigate({ to: "/admin/login", search: { motivo: "expirada" }, replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void navigate({
        to: "/admin/login",
        search: { motivo: "expirada", redirect: "/admin" },
        replace: true,
      });
      return;
    }
    if (!isAdmin) {
      void navigate({ to: "/admin/login", search: { motivo: "sin-permisos" }, replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando panelâ€¦
      </main>
    );
  }

  return (
    <AdminShell>
      <AdminPage
        title="Resumen"
        description={`Hola ${profile?.nombre ?? profile?.email ?? ""}. Desde acÃ¡ vas a poder editar los contenidos de la web.`}
      >
        <p className="text-sm text-muted-foreground">
          Las secciones de ediciÃ³n se irÃ¡n habilitando en el menÃº lateral.
        </p>
      </AdminPage>
    </AdminShell>
  );
}
