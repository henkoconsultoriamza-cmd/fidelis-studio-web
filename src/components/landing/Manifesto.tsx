import { MANIFESTO_IMAGE } from "@/data/site";

const ATTRIBUTES = [
  { n: "01", title: "Precisión", text: "Cada línea es una decisión. Nada queda librado al azar." },
  { n: "02", title: "Ritual", text: "Tiempo real por persona. Acá nadie sale apurado del sillón." },
  { n: "03", title: "Artesanía", text: "El oficio en cada gesto. La terminación que distingue un trabajo." },
];

export function Manifesto() {
  return (
    <section id="experiencia" className="relative scroll-mt-24">
      <div className="relative">
        <img
          src={MANIFESTO_IMAGE.src}
          alt={MANIFESTO_IMAGE.alt}
          width={MANIFESTO_IMAGE.w}
          height={MANIFESTO_IMAGE.h}
          loading="lazy"
          decoding="async"
          className="h-[60vh] min-h-[420px] w-full object-cover md:h-[78vh]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10"
        />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
            <div className="max-w-2xl">
              <p className="label-tech reveal-left">El ritual</p>
              <h2 className="font-display reveal-left mt-4 text-[clamp(2rem,6vw,4.8rem)]" style={{transitionDelay: "0.1s"}}>
                No hacemos
                <br />
                cortes en serie.
              </h2>
              <p className="mt-5 max-w-lg text-sm text-muted-foreground sm:text-base">
                Leemos tu estilo, trabajamos cada detalle con precisión y convertimos la visita en
                un ritual propio.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
        <div className="reveal-line border-t border-border" />
        <dl className="grid md:grid-cols-3">
          {ATTRIBUTES.map((item, i) => (
            <div key={item.title} className="reveal border-b border-border py-10 md:px-8 md:first:pl-0 md:last:pr-0" style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className="label-tech">{item.n}</span>
              <dt className="font-display mt-3 text-2xl md:text-3xl">{item.title}</dt>
              <dd className="mt-3 max-w-xs text-sm text-muted-foreground">{item.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}