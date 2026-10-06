import { useSiteContent } from "@/hooks/use-site-content";

export function Location() {
  const { brand, contact, hours, sections } = useSiteContent();

  return (
    <section id="contacto" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
        <h2 className="font-display reveal text-[clamp(2.2rem,6.5vw,5.5rem)]">
          Encontranos<span className="text-acid">.</span>
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="reveal">
            <p className="label-tech">Dirección</p>
            <p className="mt-3 text-lg">
              {brand.name}
              <br />
              {contact.street}
              <br />
              {contact.cityLine}
            </p>

            {sections.horarios && hours.length > 0 ? (
              <>
                <p className="label-tech mt-10">Horarios</p>
                <dl className="mt-3 divide-y divide-border border-y border-border">
                  {hours.map((h) => (
                    <div key={h.days} className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-sm text-muted-foreground">{h.days}</dt>
                      <dd className="text-sm">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}
            <p className="label-tech mt-4 text-acid">{contact.note}</p>

            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {contact.phone ? (
                <li>
                  <a className="hover:text-acid" href={contact.phoneHref}>
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              {sections.whatsapp && contact.whatsapp ? (
                <li>
                  <a
                    className="hover:text-acid"
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {contact.instagram ? (
                <li>
                  <a
                    className="hover:text-acid"
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contact.instagramHandle}
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a className="hover:text-acid" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="reveal flex min-h-[320px] flex-col justify-between rounded-[4px] border border-border bg-elevated p-6 md:p-10">
            <div
              aria-hidden="true"
              className="grid h-40 grid-cols-6 gap-px overflow-hidden rounded-[4px] bg-border"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className={i === 9 ? "bg-acid" : i % 5 === 0 ? "bg-surface" : "bg-background"}
                />
              ))}
            </div>
            <div className="mt-8">
              <p className="label-tech">Mapa</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                A tres cuadras del centro, con estacionamiento sobre la calle lateral.
              </p>
              <a
                href={contact.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[4px] border border-acid px-6 text-sm tracking-[0.12em] text-acid uppercase transition-colors hover:bg-acid hover:text-acid-foreground"
              >
                Cómo llegar
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}