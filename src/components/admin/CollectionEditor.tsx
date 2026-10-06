/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin-session";
import { limpiarCampos, registrarCambio } from "@/lib/admin-data";
import { resolveImageUrl } from "@/lib/media";
import { ImageField } from "./ImageField";
import { cn } from "@/lib/utils";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "image" | "select";
  bucket?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  help?: string;
  min?: number;
  max?: number;
};

export type CollectionConfig = {
  table: "servicios" | "equipo" | "galeria" | "testimonios" | "promociones";
  entityLabel: string;
  activeField: "activo" | "activa";
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  fields: FieldDef[];
  defaults: Record<string, any>;
  emptyText: string;
};

type Row = { id?: string; orden?: number | null; [key: string]: any };

export function CollectionEditor({ config }: { config: CollectionConfig }) {
  const queryClient = useQueryClient();
  const { profile } = useAdminSession();
  const barberiaId = profile?.barberiaId ?? null;
  const [editing, setEditing] = useState<Row | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin", config.table, barberiaId],
    enabled: !!barberiaId,
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await (supabase.from(config.table) as any)
        .select("*")
        .eq("barberia_id", barberiaId)
        .order("orden", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const rows = listQuery.data ?? [];

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["admin", config.table] });
    void queryClient.invalidateQueries({ queryKey: ["site-content"] });
  }

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const { id, created_at: _c, updated_at: _u, ...rest } = row;
      const payload = limpiarCampos(rest);
      if (!barberiaId) throw new Error("No se pudo identificar la barbería.");
      if (id) {
        const { error } = await (supabase.from(config.table) as any)
          .update(payload)
          .eq("id", id)
          .eq("barberia_id", barberiaId);
        if (error) throw error;
      } else {
        const orden = rows.length ? Math.max(...rows.map((r) => r.orden ?? 0)) + 1 : 0;
        const { error } = await (supabase.from(config.table) as any).insert({
          ...payload,
          orden,
          barberia_id: barberiaId,
        });
        if (error) throw error;
      }
      await registrarCambio({
        barberiaId,
        entidad: config.table,
        entidadId: id ?? null,
        accion: id ? "actualizar" : "crear",
        descripcion: `${id ? "Actualizó" : "Creó"} ${config.entityLabel}: ${row[config.titleField] ?? ""}`,
        usuarioId: profile?.id ?? null,
        usuarioNombre: profile?.nombre ?? profile?.email ?? null,
      });
    },
    onSuccess: () => {
      toast.success("Cambios guardados");
      setEditing(null);
      invalidate();
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "No se pudieron guardar los cambios"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!barberiaId) throw new Error("No se pudo identificar la barbería.");
      const { error } = await (supabase.from(config.table) as any)
        .delete()
        .eq("id", id)
        .eq("barberia_id", barberiaId);
      if (error) throw error;
      await registrarCambio({
        barberiaId,
        entidad: config.table,
        entidadId: id,
        accion: "eliminar",
        descripcion: `Eliminó ${config.entityLabel}`,
        usuarioId: profile?.id ?? null,
        usuarioNombre: profile?.nombre ?? profile?.email ?? null,
      });
    },
    onSuccess: () => {
      toast.success("Elemento eliminado");
      setConfirmDelete(null);
      invalidate();
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar"),
  });

  const quick = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Row }) => {
      if (!barberiaId) throw new Error("No se pudo identificar la barbería.");
      const { error } = await (supabase.from(config.table) as any)
        .update(patch)
        .eq("id", id)
        .eq("barberia_id", barberiaId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar"),
  });

  async function move(index: number, dir: -1 | 1) {
    const a = rows[index];
    const b = rows[index + dir];
    if (!a || !b) return;
    await quick.mutateAsync({ id: a.id as string, patch: { orden: b.orden ?? index + dir } });
    await quick.mutateAsync({ id: b.id as string, patch: { orden: a.orden ?? index } });
    invalidate();
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setEditing({ ...config.defaults })}
          className="inline-flex min-h-12 items-center gap-2 rounded-[4px] bg-acid px-5 text-xs font-medium tracking-[0.12em] text-acid-foreground uppercase transition-colors hover:bg-[#2ce85a]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Agregar
        </button>
      </div>

      {listQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-[4px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {config.emptyText}
        </p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {rows.map((row, index) => {
            const image = config.imageField ? resolveImageUrl(row[config.imageField]) : null;
            const activo = !!row[config.activeField];
            return (
              <li key={row.id} className="flex flex-wrap items-center gap-4 py-4">
                {config.imageField ? (
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[4px] border border-border bg-surface">
                    {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                ) : null}

                <div className="min-w-0 flex-1">
                  <p className={cn("truncate font-medium", !activo && "text-muted-foreground")}>
                    {row[config.titleField] || "(sin título)"}
                  </p>
                  {config.subtitleField ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {row[config.subtitleField]}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Subir"
                    disabled={index === 0}
                    onClick={() => void move(index, -1)}
                    className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-border transition-colors hover:border-acid hover:text-acid disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Bajar"
                    disabled={index === rows.length - 1}
                    onClick={() => void move(index, 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-border transition-colors hover:border-acid hover:text-acid disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      quick.mutate({
                        id: row.id as string,
                        patch: { [config.activeField]: !activo },
                      })
                    }
                    className={cn(
                      "min-h-11 rounded-[4px] border px-3 text-[0.65rem] tracking-[0.12em] uppercase transition-colors",
                      activo
                        ? "border-acid text-acid"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {activo ? "Visible" : "Oculto"}
                  </button>
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => setEditing({ ...row })}
                    className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-border transition-colors hover:border-acid hover:text-acid"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar"
                    onClick={() => setConfirmDelete(row.id as string)}
                    className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-border transition-colors hover:border-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="w-full max-w-sm rounded-[4px] border border-border bg-elevated p-6">
            <h2 className="font-display text-xl">¿Eliminar este elemento?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="min-h-11 rounded-[4px] border border-border px-4 text-xs tracking-[0.12em] uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => remove.mutate(confirmDelete)}
                disabled={remove.isPending}
                className="min-h-11 rounded-[4px] bg-red-500 px-4 text-xs tracking-[0.12em] text-white uppercase disabled:opacity-60"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editing ? (
        <EditorDialog
          config={config}
          row={editing}
          barberiaId={barberiaId}
          pending={save.isPending}
          onCancel={() => setEditing(null)}
          onSave={(row) => save.mutate(row)}
        />
      ) : null}
    </div>
  );
}

function EditorDialog({
  config,
  row,
  barberiaId,
  pending,
  onCancel,
  onSave,
}: {
  config: CollectionConfig;
  row: Row;
  barberiaId: string | null;
  pending: boolean;
  onCancel: () => void;
  onSave: (row: Row) => void;
}) {
  const [draft, setDraft] = useState<Row>(row);
  const set = (name: string, value: any) => setDraft((d) => ({ ...d, [name]: value }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/85 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
        className="mx-auto w-full max-w-xl rounded-[4px] border border-border bg-elevated p-6 md:p-8"
      >
        <h2 className="font-display text-2xl">
          {draft.id ? "Editar" : "Nuevo"} {config.entityLabel}
        </h2>

        <div className="mt-6 space-y-5">
          {config.fields.map((field) => {
            const value = draft[field.name];
            if (field.type === "image") {
              return (
                <ImageField
                  key={field.name}
                  label={field.label}
                  bucket={field.bucket ?? "galeria"}
                  barberiaId={barberiaId}
                  value={value ?? null}
                  onChange={(v) => set(field.name, v)}
                  {...(field.help ? { help: field.help } : {})}
                />
              );
            }
            return (
              <label key={field.name} className="block">
                <span className="label-tech">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    value={value ?? ""}
                    required={field.required}
                    placeholder={field.placeholder}
                    rows={3}
                    onChange={(e) => set(field.name, e.target.value)}
                    className="mt-2 w-full rounded-[4px] border border-border bg-background p-3 text-sm outline-none focus-visible:border-acid"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={value ?? ""}
                    onChange={(e) => set(field.name, e.target.value)}
                    className="mt-2 min-h-12 w-full rounded-[4px] border border-border bg-background px-3 text-sm outline-none focus-visible:border-acid"
                  >
                    {(field.options ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={value ?? ""}
                    required={field.required}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    onChange={(e) =>
                      set(
                        field.name,
                        field.type === "number"
                          ? e.target.value === ""
                            ? null
                            : Number(e.target.value)
                          : e.target.value,
                      )
                    }
                    className="mt-2 min-h-12 w-full rounded-[4px] border border-border bg-background px-3 text-sm outline-none focus-visible:border-acid"
                  />
                )}
                {field.help ? (
                  <span className="mt-1 block text-xs text-muted-foreground">{field.help}</span>
                ) : null}
              </label>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-[4px] border border-border px-5 text-xs tracking-[0.12em] uppercase"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 items-center gap-2 rounded-[4px] bg-acid px-5 text-xs font-medium tracking-[0.12em] text-acid-foreground uppercase disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}