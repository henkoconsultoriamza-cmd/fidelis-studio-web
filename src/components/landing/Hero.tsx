import { HERO_IMAGE, BRAND } from "@/data/site";
import { ExternalBookingButton } from "./ExternalBookingButton";
import { useHeroScroll } from "@/hooks/use-scroll-effects";

export function Hero() {
  const sectionRef = useHeroScroll();

  return (
    <section
      id="top"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative h-screen min-h-[600px] overflow-hidden"
      style={{ transformOrigin: "center top", willChange: "clip-path, transform" }}
    >
      {/* Imagen de fondo con parallax */}
      <img
        data-parallax
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        width={HERO_IMAGE.w}
        height={HERO_IMAGE.h}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-[120%] w-full object-cover object-center -top-[10%]"
        style={{ willChange: "transform" }}
      />

      {/* Overlays */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

      {/* Contenido */}
      <div className="relative z-10 flex h-full items-end px-5 pb-16 md:px-12 lg:px-20">
        <div className="max-w-lg">
          <p className="label-tech reveal mb-5 tracking-[0.25em]">
            Barbería de autor · {BRAND.city}
          </p>

          <h1 className="font-display reveal text-[clamp(2.2rem,5vw,4.2rem)] leading-tight">
            El corte que define
            <br />
            <span className="opacity-60">tu versión exacta.</span>
          </h1>

          <p className="reveal mt-5 max-w-sm text-sm text-muted-foreground sm:text-base">
            Cada visita es un ritual. Técnica precisa, atención personalizada y el resultado que buscabas.
          </p>

          <div className="reveal mt-7 flex flex-wrap gap-3">
            <ExternalBookingButton size="lg" />
            <a
              href="#servicios"
              className="inline-flex min-h-14 items-center justify-center rounded-[4px] border border-foreground/30 px-8 text-sm tracking-[0.12em] uppercase transition-colors hover:border-acid hover:text-acid"
            >
              Ver servicios
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
