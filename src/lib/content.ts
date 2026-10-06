import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl } from "@/lib/media";
import {
  BOOKING_URL,
  BRAND,
  CONTACT,
  GALLERY,
  HOURS,
  HOURS_SHORT,
  REVIEWS,
  SERVICES,
  SOCIALS,
  TEAM,
} from "@/data/site";

export type ContentService = {
  id: string;
  number: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  image: string | null;
  imageAlt: string;
};

export type ContentMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  instagram: string | null;
  instagramHandle: string | null;
  image: string | null;
  alt: string;
};

export type ContentGalleryItem = {
  id: string;
  src: string;
  alt: string;
  tone: "bw" | "warm";
};

export type ContentReview = { id: string; quote: string; author: string; rating: number };
export type ContentHour = { days: string; time: string };
export type ContentPromo = {
  id: string;
  title: string;
  description: string;
  price: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  image: string | null;
};

export type SiteContent = {
  barberiaId: string | null;
  brand: { name: string; short: string; line2: string; tagline: string; city: string; credit: string };
  booking: { url: string; label: string; newTab: boolean };
  contact: {
    street: string;
    cityLine: string;
    phone: string;
    phoneHref: string;
    whatsapp: string;
    email: string;
    instagram: string;
    instagramHandle: string;
    maps: string;
    note: string;
  };
  socials: { label: string; href: string }[];
  services: ContentService[];
  team: ContentMember[];
  gallery: ContentGalleryItem[];
  reviews: ContentReview[];
  hours: ContentHour[];
  hoursShort: string;
  promos: ContentPromo[];
  sections: {
    servicios: boolean;
    equipo: boolean;
    galeria: boolean;
    testimonios: boolean;
    promociones: boolean;
    horarios: boolean;
    whatsapp: boolean;
    reservas: boolean;
  };
};

function splitBrand(name: string) {
  const words = name.trim().split(/\s+/);
  return {
    short: (words[0] ?? name).toUpperCase(),
    line2: words.slice(1).join(" ").toUpperCase() || "",
  };
}

/** Devuelve el texto cargado o, si está vacío, el valor por defecto. */
function txt(value: string | null | undefined, fallback: string): string {
  const v = value?.trim();
  return v ? v : fallback;
}

/** Devuelve el texto cargado o null si está vacío. */
function opt(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

/**
 * Conserva el último contenido válido de cada sección si una consulta puntual
 * falla. Un resultado vacío sigue siendo válido para poder vaciar una sección
 * deliberadamente desde el panel.
 */
function rowsOrFallback<T>(
  result: { data: T[] | null; error: unknown },
  fallback: T[],
): T[] {
  return result.error ? fallback : (result.data ?? []);
}

export const FALLBACK_CONTENT: SiteContent = {
  barberiaId: null,
  brand: { ...BRAND },
  booking: { url: BOOKING_URL, label: "Reservar turno", newTab: true },
  contact: { ...CONTACT },
  socials: SOCIALS.map((s) => ({ ...s })),
  services: SERVICES.map((s) => ({ ...s })),
  team: TEAM.map((m) => ({ ...m })),
  gallery: GALLERY.map((g, i) => ({ id: String(i), src: g.src, alt: g.alt, tone: g.tone })),
  reviews: REVIEWS.map((r, i) => ({ id: String(i), ...r })),
  hours: HOURS.map((h) => ({ ...h })),
  hoursShort: HOURS_SHORT,
  promos: [],
  sections: {
    servicios: true,
    equipo: true,
    galeria: true,
    testimonios: true,
    promociones: true,
    horarios: true,
    whatsapp: true,
    reservas: true,
  },
};

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatPrice(precio: number | null, precioTexto: string | null): string {
  if (precioTexto?.trim()) return precioTexto.trim();
  if (precio == null) return "";
  return currency.format(precio).replace(/\s/g, " ");
}

export function formatTime(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 5);
}

type HorarioRow = {
  dia_semana: number;
  nombre_dia: string | null;
  hora_apertura: string | null;
  hora_cierre: string | null;
  cerrado: boolean;
};

export function buildHours(rows: HorarioRow[]): ContentHour[] {
  const sorted = [...rows].sort((a, b) => a.dia_semana - b.dia_semana);
  const groups: { labels: string[]; time: string }[] = [];

  for (const row of sorted) {
    const time = row.cerrado
      ? "Cerrado"
      : `${formatTime(row.hora_apertura)} a ${formatTime(row.hora_cierre)}`;
    const label = row.nombre_dia ?? "";
    const last = groups[groups.length - 1];
    if (last && last.time === time) last.labels.push(label);
    else groups.push({ labels: [label], time });
  }

  return groups.map((g) => ({
    days: g.labels.length > 1 ? `${g.labels[0]} a ${g.labels[g.labels.length - 1]}` : g.labels[0]!,
    time: g.time,
  }));
}

function shortHours(hours: ContentHour[]): string {
  return hours
    .map((h) => `${h.days} ${h.time === "Cerrado" ? "cerrado" : h.time.replace(" a ", "–")}`)
    .join(" · ");
}

function waHref(value: string | null): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const { data: barberia, error: barberiaError } = await supabase
    .from("barberias")
    .select("*")
    .eq("activa", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (barberiaError || !barberia) return FALLBACK_CONTENT;
  const id = barberia.id;

  const [servicios, equipo, galeria, horarios, testimonios, promociones, config] = await Promise.all([
    supabase.from("servicios").select("*").eq("barberia_id", id).eq("activo", true).order("orden"),
    supabase.from("equipo").select("*").eq("barberia_id", id).eq("activo", true).order("orden"),
    supabase.from("galeria").select("*").eq("barberia_id", id).eq("activo", true).order("orden"),
    supabase.from("horarios").select("*").eq("barberia_id", id).order("dia_semana"),
    supabase.from("testimonios").select("*").eq("barberia_id", id).eq("activo", true).order("orden"),
    supabase.from("promociones").select("*").eq("barberia_id", id).eq("activa", true).order("orden"),
    supabase.from("configuracion_web").select("*").eq("barberia_id", id).maybeSingle(),
  ]);

  const nombre = txt(barberia.nombre, BRAND.name);
  const brandNames = splitBrand(nombre);
  const serviciosRows = rowsOrFallback(servicios, []);
  const equipoRows = rowsOrFallback(equipo, []);
  const galeriaRows = rowsOrFallback(galeria, []);
  const horariosRows = rowsOrFallback(horarios, []);
  const testimoniosRows = rowsOrFallback(testimonios, []);
  const promocionesRows = rowsOrFallback(promociones, []);
  const hours = horarios.error ? FALLBACK_CONTENT.hours : buildHours(horariosRows);
  const ciudad = opt(barberia.ciudad);
  const provincia = opt(barberia.provincia);
  const cityLine = [ciudad, provincia === ciudad ? null : provincia]
    .filter(Boolean)
    .join(", ");

  const cfg = config.error ? null : config.data;

  return {
    barberiaId: id,
    brand: {
      name: nombre,
      short: brandNames.short,
      line2: brandNames.line2 || BRAND.line2,
      tagline: txt(barberia.slogan, BRAND.tagline),
      city: txt(barberia.ciudad, BRAND.city),
      credit: BRAND.credit,
    },
    booking: {
      url: txt(barberia.reserva_url, BOOKING_URL),
      label: txt(barberia.reserva_texto_boton, "Reservar turno"),
      newTab: barberia.reserva_nueva_pestana ?? true,
    },
    contact: {
      street: txt(barberia.direccion, CONTACT.street),
      cityLine: cityLine || CONTACT.cityLine,
      phone: txt(barberia.telefono, CONTACT.phone),
      phoneHref: `tel:${txt(barberia.telefono, CONTACT.phone).replace(/[^\d+]/g, "")}`,
      whatsapp: waHref(opt(barberia.whatsapp)),
      email: txt(barberia.email, CONTACT.email),
      instagram: txt(barberia.instagram_url, CONTACT.instagram),
      instagramHandle: opt(barberia.instagram_url)
        ? `@${(barberia.instagram_url ?? "").trim().replace(/\/+$/, "").split("/").pop()}`
        : CONTACT.instagramHandle,
      maps: txt(barberia.google_maps_url, CONTACT.maps),
      note: CONTACT.note,
    },
    socials: [
      opt(barberia.instagram_url) ? { label: "Instagram", href: opt(barberia.instagram_url) ?? "" } : null,
      opt(barberia.whatsapp) ? { label: "WhatsApp", href: waHref(opt(barberia.whatsapp)) } : null,
      opt(barberia.facebook_url) ? { label: "Facebook", href: opt(barberia.facebook_url) ?? "" } : null,
      opt(barberia.tiktok_url) ? { label: "TikTok", href: opt(barberia.tiktok_url) ?? "" } : null,
      opt(barberia.youtube_url) ? { label: "YouTube", href: opt(barberia.youtube_url) ?? "" } : null,
      opt(barberia.google_maps_url) ? { label: "Google", href: opt(barberia.google_maps_url) ?? "" } : null,
    ].filter(Boolean) as { label: string; href: string }[],
    services: servicios.error ? FALLBACK_CONTENT.services : serviciosRows.map((s, i) => ({
      id: s.id,
      number: String(i + 1).padStart(2, "0"),
      name: s.nombre,
      description: opt(s.descripcion) ?? "",
      duration: s.duracion_minutos ? `${s.duracion_minutos} min` : "",
      price: formatPrice(s.precio, s.precio_texto),
      image: resolveImageUrl(s.imagen_url),
      imageAlt: txt(s.imagen_alt, s.nombre),
    })),
    team: equipo.error ? FALLBACK_CONTENT.team : equipoRows.map((m) => ({
      id: m.id,
      name: m.nombre,
      role: opt(m.cargo) ?? opt(m.especialidad) ?? "",
      bio: opt(m.descripcion) ?? "",
      instagram: opt(m.instagram_url),
      instagramHandle: opt(m.instagram_handle),
      image: resolveImageUrl(m.foto_url),
      alt: txt(m.foto_alt, `Retrato de ${m.nombre}`),
    })),
    gallery: galeria.error ? FALLBACK_CONTENT.gallery : galeriaRows
      .map((g) => ({
        id: g.id,
        src: resolveImageUrl(g.imagen_url) ?? "",
        alt: g.texto_alt ?? "",
        tone: (g.categoria === "bw" ? "bw" : "warm") as "bw" | "warm",
      }))
      .filter((g) => g.src),
    reviews: testimonios.error ? FALLBACK_CONTENT.reviews : testimoniosRows.map((t) => ({
      id: t.id,
      quote: t.texto,
      author: t.nombre_cliente,
      rating: t.calificacion ?? 5,
    })),
    hours,
    hoursShort: hours.length ? shortHours(hours) : HOURS_SHORT,
    promos: promociones.error ? FALLBACK_CONTENT.promos : promocionesRows.map((p) => ({
      id: p.id,
      title: p.titulo,
      description: opt(p.descripcion) ?? "",
      price: p.precio_promocional != null ? formatPrice(p.precio_promocional, null) : null,
      buttonText: opt(p.texto_boton),
      buttonHref: opt(p.enlace_boton),
      image: resolveImageUrl(p.imagen_url),
    })),
    sections: {
      servicios: cfg?.mostrar_servicios ?? true,
      equipo: cfg?.mostrar_equipo ?? true,
      galeria: cfg?.mostrar_galeria ?? true,
      testimonios: cfg?.mostrar_testimonios ?? true,
      promociones: cfg?.mostrar_promociones ?? true,
      horarios: cfg?.mostrar_horarios ?? true,
      whatsapp: cfg?.mostrar_whatsapp ?? true,
      reservas: cfg?.mostrar_reservas ?? true,
    },
  };
}