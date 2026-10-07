import heroBarber from "@/assets/fidelis-fachada.jpeg";
import manifestoInterior from "@/assets/fidelis-fachada.jpeg";
import teamMateo from "@/assets/team-mateo.jpg";
import teamNico from "@/assets/team-nico.jpg";
import teamTomas from "@/assets/team-tomas.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

/**
 * URL única de la plataforma externa de reservas.
 * Cambiala acá y se actualiza en toda la página.
 */
export const BOOKING_URL = "https://example.com/reservas";

export const BRAND = {
  name: "Fidelis Studio",
  short: "FIDELIS",
  line2: "STUDIO",
  tagline: "Precisión. Estilo. Ritual.",
  city: "Mendoza",
  credit: "Diseñado para Fidelis Studio.",
};

export const NAV_LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Experiencia", href: "#experiencia" },
  { label: "Equipo", href: "#equipo" },
  { label: "Galería", href: "#galeria" },
  { label: "Opiniones", href: "#opiniones" },
  { label: "Contacto", href: "#contacto" },
] as const;

export type Service = {
  id: string;
  number: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  image: string;
  imageAlt: string;
};

export const SERVICES: Service[] = [
  {
    id: "corte",
    number: "01",
    name: "Corte Fidelis",
    description: "Diagnóstico, corte y terminación a medida.",
    duration: "45 min",
    price: "$18.000",
    image: gallery1,
    imageAlt: "Nuca con fade prolijo recién terminado en blanco y negro",
  },
  {
    id: "corte-barba",
    number: "02",
    name: "Corte + Barba",
    description: "Servicio integral. Corte, diseño de barba y perfilado.",
    duration: "75 min",
    price: "$26.000",
    image: gallery2,
    imageAlt: "Barbero perfilando la barba de un cliente con navaja",
  },
  {
    id: "barba",
    number: "03",
    name: "Barba Fidelis",
    description: "Diseño, arquitectura y cuidado de la barba.",
    duration: "30 min",
    price: "$12.000",
    image: gallery6,
    imageAlt: "Perfil de un cliente con barba diseñada frente al espejo",
  },
  {
    id: "perfilado",
    number: "04",
    name: "Perfilado",
    description: "Contornos y detalles con precisión de navaja.",
    duration: "20 min",
    price: "$9.000",
    image: gallery4,
    imageAlt: "Manos del barbero trabajando con peine y tijera",
  },
  {
    id: "experiencia",
    number: "05",
    name: "Ritual Completo",
    description: "Corte, barba, vapores y styling. La experiencia completa.",
    duration: "90 min",
    price: "$34.000",
    image: gallery5,
    imageAlt: "Cliente relajado con toalla caliente en el sillón de barbería",
  },
];

export const TEAM = [
  {
    id: "mateo",
    name: "Mateo",
    role: "Cortes clásicos y fades",
    bio: "Precisión en la máquina y lectura del rostro. Su fade es una firma.",
    instagram: "https://instagram.com",
    instagramHandle: "@mateo.fidelis",
    image: teamMateo,
    alt: "Retrato en blanco y negro de Mateo, barbero de Fidelis Studio",
  },
  {
    id: "nico",
    name: "Nico",
    role: "Barba y styling",
    bio: "Trabaja la barba como arquitectura: contorno, densidad y proporción.",
    instagram: "https://instagram.com",
    instagramHandle: "@nico.fidelis",
    image: teamNico,
    alt: "Retrato en blanco y negro de Nico, especialista en barba",
  },
  {
    id: "tomas",
    name: "Tomás",
    role: "Texturas y tendencias",
    bio: "Cortes con movimiento para pelo difícil. Le encanta el riesgo bien calculado.",
    instagram: "https://instagram.com",
    instagramHandle: "@tomas.fidelis",
    image: teamTomas,
    alt: "Retrato en blanco y negro de Tomás, barbero de texturas",
  },
];

export const GALLERY = [
  { src: gallery1, alt: "Nuca con fade y line-up recién terminado", w: 912, h: 1200, tone: "bw" as const },
  { src: gallery2, alt: "Perfilado de barba con navaja bajo luz cálida", w: 1200, h: 912, tone: "warm" as const },
  { src: gallery3, alt: "Herramientas de barbería sobre una mesada oscura", w: 912, h: 1200, tone: "warm" as const },
  { src: gallery4, alt: "Manos del barbero cortando con tijera y peine", w: 1200, h: 912, tone: "bw" as const },
  { src: gallery5, alt: "Cliente con toalla caliente en el sillón", w: 912, h: 1200, tone: "warm" as const },
  { src: gallery6, alt: "Perfil de cliente con corte y barba terminados", w: 1200, h: 912, tone: "bw" as const },
];

export const REVIEWS = [
  {
    quote: "Un nivel de atención que no encontrás en otro lado. Cada detalle importa.",
    author: "Agustín M.",
    rating: 5,
  },
  {
    quote: "Vine por el corte. Volví por la experiencia completa. No me voy a mover de acá.",
    author: "Ramiro S.",
    rating: 5,
  },
  {
    quote: "El ambiente, la precisión, el resultado. Todo en su lugar.",
    author: "Luciano P.",
    rating: 5,
  },
];

export const HOURS = [
  { days: "Lunes a sábado", time: "14:00 a 20:00" },
  { days: "Domingo", time: "Cerrado" },
];

export const HOURS_SHORT = "Lun a sáb 14–20 · Dom cerrado";

export const CONTACT = {
  street: "Patricias Mendocinas 826",
  cityLine: "Las Heras, Mendoza",
  phone: "+54 9 2616 68-6085",
  phoneHref: "tel:+5492616686085",
  whatsapp: "https://wa.me/5492616686085",
  whatsappLabel: "+54 9 2616 68-6085",
  email: "hola@fidelisstudio.com",
  instagram: "https://instagram.com/f.idelis_studio",
  instagramHandle: "@f.idelis_studio",
  maps: "https://www.google.com/maps/place/Patricias+Mendocinas+826,+M5539+Las+Heras,+Mendoza/@-32.8549214,-68.8446197,17z",
  note: "Atención con turno previo",
};

export const SOCIALS = [
  { label: "Instagram", href: CONTACT.instagram },
  { label: "WhatsApp", href: CONTACT.whatsapp },
  { label: "Google", href: "https://maps.google.com" },
];

export const HERO_IMAGE = {
  src: heroBarber,
  alt: "Fachada nocturna de Fidelis Studio con cartel iluminado y barber pole",
  w: 1280,
  h: 960,
};

export const MANIFESTO_IMAGE = {
  src: manifestoInterior,
  alt: "Entrada de Fidelis Studio de noche, con identidad propia e iluminación cálida",
  w: 1280,
  h: 960,
};