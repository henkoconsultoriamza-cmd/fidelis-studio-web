import { supabase } from "@/integrations/supabase/client";

/**
 * Limpia lo que se envía a la base: recorta espacios y convierte los campos
 * de texto vacíos en null, para que la web use sus valores por defecto en vez
 * de mostrar huecos en blanco.
 */
export function limpiarCampos<T extends Record<string, unknown>>(payload: T): T {
  const salida: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(payload)) {
    if (typeof valor === "string") {
      const limpio = valor.trim();
      salida[clave] = limpio === "" ? null : limpio;
    } else {
      salida[clave] = valor;
    }
  }
  return salida as T;
}

export async function fetchBarberiaAdmin(barberiaId: string) {
  const { data, error } = await supabase
    .from("barberias")
    .select("*")
    .eq("id", barberiaId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function registrarCambio(input: {
  barberiaId: string | null;
  entidad: string;
  entidadId?: string | null;
  accion: string;
  descripcion: string;
  usuarioId?: string | null;
  usuarioNombre?: string | null;
}) {
  await supabase.from("registro_cambios").insert({
    barberia_id: input.barberiaId,
    entidad: input.entidad,
    entidad_id: input.entidadId ?? null,
    accion: input.accion,
    descripcion: input.descripcion,
    usuario_id: input.usuarioId ?? null,
    usuario_nombre: input.usuarioNombre ?? null,
  });
}

export async function subirImagen(bucket: string, barberiaId: string, file: File) {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${barberiaId}/${crypto.randomUUID()}.${ext || "jpg"}`;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error("Tu sesión expiró. Volvé a iniciar sesión para subir imágenes.");
  }
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (error) {
    throw new Error(`No se pudo subir la imagen (${bucket}): ${error.message}`);
  }
  return `${bucket}/${path}`;
}