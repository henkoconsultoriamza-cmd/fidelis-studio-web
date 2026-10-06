/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard, adminHead } from "@/components/admin/AdminGuard";
import { AdminPage } from "@/components/admin/AdminShell";
import { ImageField } from "@/components/admin/ImageField";
import { fetchBarberiaAdmin, limpiarCampos, registrarCambio } from "@/lib/admin-data";
import { useAdminSession } from "@/hooks/use-admin-session";

export const Route = createFileRoute("/admin/general")({
  ssr: false,
  head: adminHead("Datos generales"),
  component: Page,
});

type Campo = { name: string; label: string; placeholder?: string; type?: "text" | "textarea" };

const CONTACTO: Campo[] = [
  { name: "telefono", label: "Teléfono", placeholder: "+54 11 5555 5555" },
  { name: "whatsapp", label: "WhatsApp", placeholder: "5491155555555" },
  { name: "email", label: "Email", placeholder: "hola@barberia.com" },
  { name: "direccion", label: "Dirección", placeholder: "Av. Siempreviva 742" },
  { name: "ciudad", label: "Ciudad" },
  { name: "provincia", label: "Provincia" },
  { name: "codigo_postal", label: "Código postal" },
  { name: "google_maps_url", label: "Link de Google Maps", placeholder: "https://maps.google.com/..." },
];

const REDES: Campo[] = [
  { name: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/..." },
  { name: "facebook_url", label: "Facebook" },
  { name: "tiktok_url", label: "TikTok" },
  { name: "youtube_url", label: "YouTube" },
];

function Page() {
  return (
    <AdminGuard redirect="/admin/general">
      <AdminPage
        title="Datos generales"
        description="Nombre, logo, contacto y redes de la barbería. Estos datos se usan en toda la web."
      >
        <Form />
      </AdminPage>
    </AdminGuard>
  );
}

function Form() {
  const queryClient = useQueryClient();
  const { profile } = useAdminSession();
  const barberiaId = profile?.barberiaId ?? null;
  const [draft, setDraft] = useState<Record<string, unknown>>({});

  const query = useQuery({
    queryKey: ["admin", "barberia", barberiaId],
    enabled: !!barberiaId,
    queryFn: () => (barberiaId ? fetchBarberiaAdmin(barberiaId) : null),
  });

  useEffect(() => {
    if (query.data) setDraft({ ...query.data });
  }, [query.data]);

  const set = (name: string, value: unknown) => setDraft((d) => ({ ...d, [name]: value }));

  const save = useMutation({
    mutationFn: async () => {
      const id = draft["id"] as string | undefined;
      if (!id || id !== barberiaId) throw new Error("No se encontró la barbería.");
      const { id: _omit, created_at: _c, updated_at: _u, ...resto } = draft as Record<string, unknown> & {
        id: string;
      };
      const payload = limpiarCampos(resto);
      if (!payload["nombre"]) throw new Error("El nombre de la barbería no puede quedar vacío.");
      const { error } = await (supabase.from("barberias") as any).update(payload).eq("id", id);
      if (error) throw error;
      await registrarCambio({
        barberiaId: id,
        entidad: "barberias",
        entidadId: id,
        accion: "actualizar",
        descripcion: "Actualizó los datos generales",
        usuarioId: profile?.id ?? null,
        usuarioNombre: profile?.nombre ?? profile?.email ?? null,
      });
    },
    onSuccess: () => {
      toast.success("Datos guardados");
      void queryClient.invalidateQueries({ queryKey: ["admin", "barberia"] });
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "No se pudieron guardar los datos"),
  });

  if (query.isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (!query.data)
    return <p className="text-sm text-muted-foreground">No se encontró la barbería.</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="max-w-2xl space-y-10"
    >
      <fieldset className="space-y-5">
        <legend className="label-tech mb-3">Identidad</legend>
        <Text label="Nombre" value={draft["nombre"]} onChange={(v) => set("nombre", v)} required />
        <Text label="Slogan" value={draft["slogan"]} onChange={(v) => set("slogan", v)} />
        <Text
          label="Descripción"
          textarea
          value={draft["descripcion"]}
          onChange={(v) => set("descripcion", v)}
        />
        <ImageField
          label="Logo"
          bucket="logos"
          barberiaId={(draft["id"] as string) ?? null}
          value={(draft["logo_url"] as string) ?? null}
          onChange={(v) => set("logo_url", v)}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="label-tech mb-3">Contacto y ubicación</legend>
        {CONTACTO.map((f) => (
          <Text
            key={f.name}
            label={f.label}
            placeholder={f.placeholder}
            value={draft[f.name]}
            onChange={(v) => set(f.name, v)}
          />
        ))}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="label-tech mb-3">Redes sociales</legend>
        {REDES.map((f) => (
          <Text
            key={f.name}
            label={f.label}
            placeholder={f.placeholder}
            value={draft[f.name]}
            onChange={(v) => set(f.name, v)}
          />
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={save.isPending}
        className="min-h-12 rounded-[4px] bg-acid px-6 text-xs font-medium tracking-[0.12em] text-acid-foreground uppercase transition-colors hover:bg-[#2ce85a] disabled:opacity-60"
      >
        {save.isPending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  required,
}: {
  label: string;
  value: unknown;
  onChange: (v: string) => void;
  placeholder?: string | undefined;
  textarea?: boolean;
  required?: boolean;
}) {
  const v = typeof value === "string" ? value : "";
  return (
    <label className="block">
      <span className="label-tech">{label}</span>
      {textarea ? (
        <textarea
          value={v}
          rows={3}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-[4px] border border-border bg-background p-3 text-sm outline-none focus-visible:border-acid"
        />
      ) : (
        <input
          type="text"
          value={v}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 min-h-12 w-full rounded-[4px] border border-border bg-background px-3 text-sm outline-none focus-visible:border-acid"
        />
      )}
    </label>
  );
}
