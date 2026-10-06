import { useSiteContent } from "@/hooks/use-site-content";

export function Promos() {
  const { promos, booking } = useSiteContent();
  if (promos.length === 0) return null;

  return (
    <section id="promociones" className="scroll-mt-24 border-t border-border py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.5rem)]">
            Promos vigentes<span className="text-acid">.</span>
          </h2>
          <p className="label-tech">Por tiempo limitado</p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <li
              key={promo.id}
              className="reveal flex flex-col overflow-hidden rounded-[4px] border border-border bg-elevated"
            >
              {promo.image ? (
                <img
                  src={promo.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-2xl">{promo.title}</h3>
                {promo.description ? (
                  <p className="mt-3 text-sm text-muted-foreground">{promo.description}</p>
                ) : null}
                {promo.price ? (
                  <p className="mt-4 text-lg font-medium text-acid">{promo.price}</p>
                ) : null}
                <a
                  href={promo.buttonHref || booking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-12 items-center justify-center self-start rounded-[4px] border border-acid px-6 text-xs tracking-[0.14em] text-acid uppercase transition-colors hover:bg-acid hover:text-acid-foreground"
                >
                  {promo.buttonText || booking.label}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}