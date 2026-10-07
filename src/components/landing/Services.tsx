import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export function Services() {
  const { services, booking } = useSiteContent();

  if (services.length === 0) return null;

  return (
    <section id="servicios" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
        <div className="reveal grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.5rem)] lg:col-span-7">
            Servicios
            <br />
            sin vueltas<span className="text-acid">.</span>
          </h2>
          <p className="text-muted-foreground lg:col-span-4 lg:col-start-9">
            Elegí tu experiencia. El turno se confirma desde nuestra agenda externa.
          </p>
        </div>

        <div className="relative mt-12 border-t border-border">
          {services.map((service) => (
            <a
              key={service.id}
              href={booking.url}
              target={booking.newTab ? "_blank" : undefined}
              rel={booking.newTab ? "noopener noreferrer" : undefined}

              className="reveal group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-2 border-b border-border py-6 transition-colors duration-300 hover:text-acid focus-visible:text-acid md:grid-cols-[3rem_minmax(0,1.1fr)_minmax(0,1fr)_6rem_7rem_3rem] md:items-center md:gap-x-6 md:py-8"
            >
              <span className="label-tech transition-colors group-hover:text-acid">
                {service.number}
              </span>

              <span className="font-display col-start-2 text-[clamp(1.5rem,4.2vw,2.6rem)]">
                {service.name}
              </span>

              <span className="col-span-3 text-sm text-muted-foreground md:col-span-1 md:col-start-3">
                {service.description}
              </span>

              <span className="label-tech col-start-1 md:col-start-4 md:text-right">
                {service.duration}
              </span>

              <span className="col-start-2 font-medium tracking-tight md:col-start-5 md:text-right md:text-lg">
                {service.price}
              </span>

              <span className="col-start-3 flex items-center justify-end gap-2 text-xs tracking-[0.14em] uppercase md:col-start-6">
                <span className="sr-only">Reservar {service.name}</span>
                <span aria-hidden="true" className="hidden md:inline-block">
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span aria-hidden="true" className="text-acid md:hidden">
                  Reservar
                </span>
              </span>
            </a>
          ))}

        </div>
      </div>
    </section>
  );
}