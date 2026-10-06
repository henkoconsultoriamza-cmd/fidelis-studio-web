export const IMAGE_BUCKETS = ["logos", "equipo", "galeria", "promociones", "testimonios"] as const;

/**
 * Resuelve la URL final de una imagen.
 * - URLs absolutas o rutas locales (/img/...) se usan tal cual.
 * - "bucket/ruta.jpg" se sirve a traves de /api/public/img/.
 */
export function resolveImageUrl(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("/")) return raw;
  return `/api/public/img/${raw.replace(/^\/+/, "")}`;
}