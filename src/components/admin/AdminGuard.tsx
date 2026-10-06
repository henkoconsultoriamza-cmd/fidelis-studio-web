import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "./AdminShell";

export function adminHead(title: string) {
  const full = `${title} | Panel Fidelis Studio`;
  return () => ({
    meta: [
      { title: full },
      { name: "description", content: `${title} del panel privado de Fidelis Studio.` },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: full },
      { property: "og:description", content: `${title} del panel privado de Fidelis Studio.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  });
}

export function AdminGuard({
  children,
  soloHenko = false,
  redirect = "/admin",
}: {
  children: ReactNode;
  soloHenko?: boolean;
  redirect?: string;
}) {
  const navigate = useNavigate();
  const { session, loading, isAdmin, profile } = useAdminSession();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
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
        search: { motivo: "expirada", redirect },
        replace: true,
      });
      return;
    }
    if (!isAdmin || (soloHenko && !profile?.esHenko)) {
      void navigate({ to: "/admin/login", search: { motivo: "sin-permisos" }, replace: true });
    }
  }, [loading, session, isAdmin, soloHenko, profile?.esHenko, navigate, redirect]);

  if (loading || !session || !isAdmin || (soloHenko && !profile?.esHenko)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando panelâ€¦
      </main>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

