import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Indica si todavía no existe ninguna cuenta de administración (bootstrap inicial). */
export const necesitaBootstrap = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return { necesita: (count ?? 0) === 0 };
});

const bootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  nombre: z.string().min(2).max(80),
});

/** Crea la primera cuenta de administración. Sólo funciona si no existe ninguna. */
export const crearPrimerAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bootstrapSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) throw new Error("Ya existe una cuenta de administración.");

    const { data: barberia } = await supabaseAdmin
      .from("barberias")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { nombre: data.nombre, barberia_id: barberia?.id ?? null },
    });
    if (error || !created.user) throw new Error(error?.message ?? "No se pudo crear la cuenta.");

    await supabaseAdmin
      .from("perfiles")
      .update({ barberia_id: barberia?.id ?? null, nombre: data.nombre })
      .eq("id", created.user.id);
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "henko_admin" });
    if (roleError) throw roleError;

    return { ok: true };
  });

const invitarSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  nombre: z.string().min(2).max(80),
  rol: z.enum(["henko_admin", "cliente_admin"]),
});

/** Crea una cuenta de administración adicional. Sólo para henko_admin. */
export const crearUsuarioAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => invitarSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: esHenko, error: rolError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "henko_admin",
    });
    if (rolError) throw rolError;
    if (!esHenko) throw new Error("No tenés permisos para crear usuarios.");

    const { data: perfil } = await context.supabase
      .from("perfiles")
      .select("barberia_id")
      .eq("id", context.userId)
      .maybeSingle();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { nombre: data.nombre, barberia_id: perfil?.barberia_id ?? null },
    });
    if (error || !created.user) throw new Error(error?.message ?? "No se pudo crear la cuenta.");

    await supabaseAdmin
      .from("perfiles")
      .update({ barberia_id: perfil?.barberia_id ?? null, nombre: data.nombre })
      .eq("id", created.user.id);
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: data.rol });
    if (roleError) throw roleError;

    return { ok: true };
  });