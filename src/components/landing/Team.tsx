import { useSiteContent } from "@/hooks/use-site-content";

export function Team() {
  const { team, brand } = useSiteContent();
  if (team.length === 0) return null;

  return (
    <section id="equipo" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
        <h2 className="font-display reveal max-w-3xl text-[clamp(2.2rem,6.5vw,5.5rem)]">
          Las manos detrás
          <br />
          de {brand.name.split(" ")[0]}<span className="text-acid">.</span>
        </h2>

        <ul className="mt-14 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            <li
              key={member.id}
              className="reveal relative"
              style={{ marginTop: index === 1 ? undefined : undefined }}
            >
              <div className="group relative overflow-hidden rounded-[4px]">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.alt}
                    width={912}
                    height={1200}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/4] w-full object-cover grayscale transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div aria-hidden="true" className="aspect-[3/4] w-full bg-surface" />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent"
                />
                <h3 className="font-display absolute -bottom-1 left-0 text-[clamp(2.2rem,6vw,3.4rem)] text-foreground">
                  {member.name}
                </h3>
              </div>
              <p className="label-tech mt-5 text-acid">{member.role}</p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">{member.bio}</p>
              {member.instagram && member.instagramHandle ? (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center text-xs tracking-[0.14em] uppercase underline decoration-border underline-offset-4 transition-colors hover:text-acid hover:decoration-acid"
                >
                  {member.instagramHandle}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}