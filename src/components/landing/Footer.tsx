import { NAV_LINKS } from "@/data/site";
import { useSiteContent } from "@/hooks/use-site-content";
import { Wordmark } from "./Wordmark";

export function Footer({ id }: { id?: string }) {
  const { brand, booking, contact, hoursShort, socials } = useSiteContent();

  return (
    <footer id={id} className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Wordmark size="lg" />
            <p className="font-display mt-6 text-2xl">{brand.tagline}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              {contact.street} · {contact.cityLine}
              <br />
              {hoursShort}
            </p>
          </div>

          <nav aria-label="Navegación del pie">
            <p className="label-tech">Secciones</p>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-acid">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label-tech">Redes</p>
            <ul className="mt-4 space-y-2 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-acid"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={booking.url}
                  target={booking.newTab ? "_blank" : undefined}
                  rel={booking.newTab ? "noopener noreferrer" : undefined}
                  className="text-acid underline underline-offset-4"
                >
                  {booking.label}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. Todos los derechos reservados.
          </p>
          <p>Precios y horarios sujetos a modificación sin previo aviso.</p>
          <p>{brand.credit}</p>
        </div>
      </div>
    </footer>
  );
}