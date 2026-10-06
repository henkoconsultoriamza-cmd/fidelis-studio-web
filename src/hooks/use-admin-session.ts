import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AdminProfile = {
  id: string;
  nombre: string | null;
  email: string | null;
  barberiaId: string | null;
  roles: string[];
  esHenko: boolean;
};

export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  const profile = useQuery({
    queryKey: ["admin-profile", userId],
    enabled: !!userId,
    staleTime: 30_000,
    queryFn: async (): Promise<AdminProfile | null> => {
      if (!userId) return null;
      const [{ data: perfil }, { data: roles }] = await Promise.all([
        supabase.from("perfiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);
      const roleList = (roles ?? []).map((r) => r.role as string);
      return {
        id: userId,
        nombre: perfil?.nombre ?? null,
        email: perfil?.email ?? session?.user.email ?? null,
        barberiaId: perfil?.barberia_id ?? null,
        roles: roleList,
        esHenko: roleList.includes("henko_admin"),
      };
    },
  });

  return {
    session,
    loading: loading || (!!userId && profile.isLoading),
    profile: profile.data ?? null,
    isAdmin: (profile.data?.roles.length ?? 0) > 0,
  };
}