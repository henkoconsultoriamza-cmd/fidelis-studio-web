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

          <div className="reveal flex flex-col overflow-hidden rounded-[4px] border border-border">
            <div className="relative h-[420px] md:h-[500px]">
              <iframe
                title="Ubicación Fidelis Studio"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3350.6!2d-68.8446197!3d-32.8549214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e0891894483c1%3A0x2338507efeae7d31!2sPatricias%20Mendocinas%20826%2C%20Las%20Heras%2C%20Mendoza!5e0!3m2!1ses!2sar!4v1"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(100%) invert(92%) contrast(90%)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="bg-elevated px-6 py-5">
              <a
                href={contact.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-[4px] border border-foreground/30 px-6 text-sm tracking-[0.12em] uppercase transition-colors hover:border-foreground hover:text-foreground"
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