/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard, adminHead } from "@/components/admin/AdminGuard";
import { AdminPage } from "@/components/admin/AdminShell";
import { registrarCambio, fetchBarberiaAdmin } from "@/lib/admin-data";
import { useAdminSession } from "@/hooks/use-admin-session";

export const Route = createFileRoute("/admin/secciones")({
  ssr: false,
  head: adminHead("Secciones y reservas"),
  component: Page,
});

const TOGGLES = [
  { name: "mostrar_servicios", label: "Servicios" },
  { name: "mostrar_equipo", label: "Equipo" },
  { name: "mostrar_galeria", label: "Galería" },
  { name: "mostrar_testimonios", label: "Testimonios" },
  { name: "mostrar_promociones", label: "Promociones" },
  { name: "mostrar_horarios", label: "Horarios" },
  { name: "mostrar_whatsapp", label: "Botón de WhatsApp" },
  { name: "mostrar_reservas", label: "Botones de reserva" },
] as const;

function Page() {
  return (
    <AdminGuard redirect="/admin/secciones">
      <AdminPage
        title="Secciones y reservas"
        description="Elegí qué secciones se muestran en la web y configurá el enlace del botón de reservas."
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
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [reserva, setReserva] = useState({ url: "", texto: "", nuevaPestana: true });

  const configQuery = useQuery({
    queryKey: ["admin", "configuracion_web", barberiaId],
    enabled: !!barberiaId,
    queryFn: async () => {
      if (!barberiaId) return null;
      const { data, error } = await supabase
        .from("configuracion_web")
        .select("*")
        .eq("barberia_id", barberiaId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const barberiaQuery = useQuery({
    queryKey: ["admin", "barberia", barberiaId],
    enabled: !!barberiaId,
    queryFn: () => (barberiaId ? fetchBarberiaAdmin(barberiaId) : null),
  });

  useEffect(() => {
    if (configQuery.data) setConfig({ ...configQuery.data });
  }, [configQuery.data]);
  useEffect(() => {
    if (barberiaQuery.data)
      setReserva({
        url: barberiaQuery.data.reserva_url ?? "",
        texto: barberiaQuery.data.reserva_texto_boton ?? "",
        nuevaPestana: barberiaQuery.data.reserva_nueva_pestana ?? true,
      });
  }, [barberiaQuery.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!barberiaId) throw new Error("No se pudo identificar la barbería.");
      if (config?.["id"]) {
        const patch = Object.fromEntries(TOGGLES.map((t) => [t.name, !!config[t.name]]));
        const { error } = await (supabase
          .from("configuracion_web") as any)
          .update(patch)
          .eq("id", config["id"] as string)
          .eq("barberia_id", barberiaId);
        if (error) throw error;
      }
      const targetBarberiaId = barberiaQuery.data?.id;
      if (targetBarberiaId === barberiaId) {
        const { error } = await (supabase
          .from("barberias") as any)
          .update({
            reserva_url: reserva.url || null,
            reserva_texto_boton: reserva.texto || null,
            reserva_nueva_pestana: reserva.nuevaPestana,
          })
          .eq("id", targetBarberiaId);
        if (error) throw error;
      }
      await registrarCambio({
        barberiaId,
        entidad: "configuracion_web",
        accion: "actualizar",
        descripcion: "Actualizó las secciones visibles y el enlace de reservas",
        usuarioId: profile?.id ?? null,
        usuarioNombre: profile?.nombre ?? profile?.email ?? null,
      });
    },
    onSuccess: () => {
      toast.success("Configuración guardada");
      void queryClient.invalidateQueries({ queryKey: ["admin", "configuracion_web"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "barberia"] });
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "No se pudo guardar la configuración"),
  });

  if (configQuery.isLoading || barberiaQuery.isLoading)
    return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h2 className="label-tech mb-3">Secciones visibles</h2>
        <ul className="divide-y divide-border border-y border-border">
          {TOGGLES.map((t) => {
            const on = !!config?.[t.name];
            return (
              <li key={t.name} className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm">{t.label}</span>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setConfig((c) => ({ ...(c ?? {}), [t.name]: !on }))}
                  className={
                    on
                      ? "min-h-11 rounded-[4px] border border-acid px-4 text-[0.65rem] tracking-[0.12em] text-acid uppercase"
                      : "min-h-11 rounded-[4px] border border-border px-4 text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase hover:text-foreground"
                  }
                >
                  {on ? "Visible" : "Oculta"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-5">
        <h2 className="label-tech">Reservas</h2>
        <label className="block">
          <span className="label-tech">Link de reservas</span>
          <input
            type="text"
            value={reserva.url}
            placeholder="https://..."
            onChange={(e) => setReserva((r) => ({ ...r, url: e.target.value }))}
            className="mt-2 min-h-12 w-full rounded-[4px] border border-border bg-background px-3 text-sm outline-none focus-visible:border-acid"
          />
        </label>
        <label className="block">
          <span className="label-tech">Texto del botón</span>
          <input
            type="text"
            value={reserva.texto}
            placeholder="Reservar turno"
            onChange={(e) => setReserva((r) => ({ ...r, texto: e.target.value }))}
            className="mt-2 min-h-12 w-full rounded-[4px] border border-border bg-background px-3 text-sm outline-none focus-visible:border-acid"
          />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={reserva.nuevaPestana}
            onChange={(e) => setReserva((r) => ({ ...r, nuevaPestana: e.target.checked }))}
            className="h-4 w-4"
          />
          Abrir en una pestaña nueva
        </label>
      </div>

      <button
        type="button"
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="min-h-12 rounded-[4px] bg-acid px-6 text-xs font-medium tracking-[0.12em] text-acid-foreground uppercase transition-colors hover:bg-[#2ce85a] disabled:opacity-60"
      >
        {save.isPending ? "Guardando…" : "Guardar configuración"}
      </button>
    </div>
  );
}
