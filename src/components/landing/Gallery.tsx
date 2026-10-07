import { useSiteContent } from "@/hooks/use-site-content";
import { cn } from "@/lib/utils";

const SPANS = [
  "md:col-span-4 md:row-span-2",
  "md:col-span-5",
  "md:col-span-3 md:row-span-2",
  "md:col-span-5",
  "md:col-span-4 md:row-span-2",
  "md:col-span-5",
];

export function Gallery() {
  const { gallery } = useSiteContent();
  if (gallery.length === 0) return null;

  return (
    <section id="galeria" className="scroll-mt-24 border-t border-border py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.5rem)]">
            Trabajos que hablan<span className="text-acid">.</span>
          </h2>
          <p className="label-tech">Archivo · {gallery.length} piezas</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:auto-rows-[180px] md:grid-cols-12 md:gap-4">
          {gallery.map((item, index) => (
            <figure
              key={item.id}
              className={cn(
                "reveal group relative overflow-hidden rounded-[4px] bg-surface",
                SPANS[index % SPANS.length],
              )}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className={cn(
                  "h-full w-full object-cover grayscale transition-[transform,filter] duration-500 group-hover:scale-[1.03] group-hover:grayscale-0",
                  "aspect-[3/4] md:aspect-auto",
                )}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}