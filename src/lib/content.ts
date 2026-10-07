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
  return FALLBACK_CONTENT;
}