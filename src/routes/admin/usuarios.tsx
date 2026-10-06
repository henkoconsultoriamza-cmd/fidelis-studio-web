import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard, adminHead } from "@/components/admin/AdminGuard";
import { AdminPage } from "@/components/admin/AdminShell";
import { crearUsuarioAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/usuarios")({
  ssr: false,
  head: adminHead("Usuarios"),
  component: Page,
});

function Page() {
  return (
    <AdminGuard soloHenko redirect="/admin/usuarios">
      <AdminPage title="Usuarios" description="Cuentas con acceso al panel.">
        <Editor />
      </AdminPage>
    </AdminGuard>
  );
}

function Editor() {
  const queryClient = useQueryClient();
  const crear = useServerFn(crearUsuarioAdmin);
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "cliente_admin" });

  const list = useQuery({
    queryKey: ["admin", "usuarios"],
    queryFn: async () => {
      const [{ data: perfiles }, { data: roles }] = await Promise.all([
        supabase.from("perfiles").select("id, nombre, email, activo"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      return (perfiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as string),
      }));
    },
  });

  const create = useMutation({
    mutationFn: async () =>
      crear({
        data: {
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: form.rol as "henko_admin" | "cliente_admin",
        },
      }),
    onSuccess: () => {
      toast.success("Usuario creado");
      setForm({ nombre: "", email: "", password: "", rol: "cliente_admin" });
      void queryClient.invalidateQueries({ queryKey: ["admin", "usuarios"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "No se pudo crear el usuario"),
  });

  const input =
    "mt-2 min-h-12 w-full rounded-[4px] border border-border bg-background px-3 text-sm outline-none focus-visible:border-acid";

  return (
    <div className="max-w-2xl space-y-10">
      <ul className="divide-y divide-border border-y border-border">
        {(list.data ?? []).map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{u.nombre ?? u.email}</p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
            </div>
            <span className="label-tech shrink-0">{u.roles.join(", ") || "sin rol"}</span>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="space-y-5"
      >
        <h2 className="label-tech">Nueva cuenta</h2>
        <label className="block">
          <span className="label-tech">Nombre</span>
          <input
            className={input}
            required
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="label-tech">Email</span>
          <input
            className={input}
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="label-tech">Contraseña (mínimo 10 caracteres)</span>
          <input
            className={input}
            type="password"
            minLength={10}
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="label-tech">Rol</span>
          <select
            className={input}
            value={form.rol}
            onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
          >
            <option value="cliente_admin">Administrador de la barbería</option>
            <option value="henko_admin">Henko admin</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={create.isPending}
          className="min-h-12 rounded-[4px] bg-acid px-6 text-xs font-medium tracking-[0.12em] text-acid-foreground uppercase transition-colors hover:bg-[#2ce85a] disabled:opacity-60"
        >
          {create.isPending ? "Creando…" : "Crear usuario"}
        </button>
      </form>
    </div>
  );
}
