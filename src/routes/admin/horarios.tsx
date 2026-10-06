import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard, adminHead } from "@/components/admin/AdminGuard";
import { AdminPage } from "@/components/admin/AdminShell";
import { registrarCambio } from "@/lib/admin-data";
import { useAdminSession } from "@/hooks/use-admin-session";

export const Route = createFileRoute("/admin/horarios")({
  ssr: false,
  head: adminHead("Horarios"),
  component: Page,
});

type Horario = {
  id: string;
  dia_semana: number;
  nombre_dia: string | null;
  hora_apertura: string | null;
  hora_cierre: string | null;
  cerrado: boolean;
};

function Page() {
  return (
    <AdminGuard redirect="/admin/horarios">
      <AdminPage
        title="Horarios"
        description="Definí el horario de atención de cada día. Los días marcados como cerrados se muestran como “Cerrado”."
      >
        <Editor />
      </AdminPage>
    </AdminGuard>
  );
}

function Editor() {
  const queryClient = useQueryClient();
  const { profile } = useAdminSession();
  const barberiaId = profile?.barberiaId ?? null;
  const [rows, setRows] = useState<Horario[]>([]);

  const query = useQuery({
    queryKey: ["admin", "horarios", barberiaId],
    enabled: !!barberiaId,
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("horarios")
        .select("id, dia_semana, nombre_dia, hora_apertura, hora_cierre, cerrado")
        .eq("barberia_id", barberiaId)
        .order("dia_semana", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Horario[];
    },
  });

  useEffect(() => {
    if (query.data) setRows(query.data.map((r) => ({ ...r })));
  }, [query.data]);

  function update(id: string, patch: Partial<Horario>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!barberiaId) throw new Error("No se pudo identificar la barbería.");
      for (const row of rows) {
        const { error } = await supabase
          .from("horarios")
          .update({
            hora_apertura: row.cerrado ? null : row.hora_apertura || null,
            hora_cierre: row.cerrado ? null : row.hora_cierre || null,
            cerrado: row.cerrado,
          })
          .eq("id", row.id)
          .eq("barberia_id", barberiaId);
        if (error) throw error;
      }
      await registrarCambio({
        barberiaId: profile?.barberiaId ?? null,
        entidad: "horarios",
        accion: "actualizar",
        descripcion: "Actualizó los horarios de atención",
        usuarioId: profile?.id ?? null,
        usuarioNombre: profile?.nombre ?? profile?.email ?? null,
      });
    },
    onSuccess: () => {
      toast.success("Horarios guardados");
      void queryClient.invalidateQueries({ queryKey: ["admin", "horarios"] });
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "No se pudieron guardar los horarios"),
  });

  if (query.isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="max-w-2xl">
      <ul className="divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center gap-4 py-4">
            <span className="w-28 shrink-0 text-sm font-medium">{row.nombre_dia}</span>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={row.cerrado}
                onChange={(e) => update(row.id, { cerrado: e.target.checked })}
                className="h-4 w-4 accent-[var(--color-acid,#39ff6a)]"
              />
              Cerrado
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                aria-label={`Apertura ${row.nombre_dia}`}
                disabled={row.cerrado}
                value={(row.hora_apertura ?? "").slice(0, 5)}
                onChange={(e) => update(row.id, { hora_apertura: e.target.value })}
                className="min-h-11 rounded-[4px] border border-border bg-background px-3 text-sm outline-none focus-visible:border-acid disabled:opacity-40"
              />
              <span className="text-muted-foreground">a</span>
              <input
                type="time"
                aria-label={`Cierre ${row.nombre_dia}`}
                disabled={row.cerrado}
                value={(row.hora_cierre ?? "").slice(0, 5)}
                onChange={(e) => update(row.id, { hora_cierre: e.target.value })}
                className="min-h-11 rounded-[4px] border border-border bg-background px-3 text-sm outline-none focus-visible:border-acid disabled:opacity-40"
              />
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="mt-8 min-h-12 rounded-[4px] bg-acid px-6 text-xs font-medium tracking-[0.12em] text-acid-foreground uppercase transition-colors hover:bg-[#2ce85a] disabled:opacity-60"
      >
        {save.isPending ? "Guardando…" : "Guardar horarios"}
      </button>
    </div>
  );
}
