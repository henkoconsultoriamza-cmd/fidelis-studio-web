import { useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export function Reviews() {
  const [index, setIndex] = useState(0);
  const { reviews } = useSiteContent();
  const review = reviews[Math.min(index, Math.max(reviews.length - 1, 0))];

  const go = (dir: number) => setIndex((i) => (i + dir + reviews.length) % reviews.length);

  if (!review) return null;

  return (
    <section id="opiniones" className="scroll-mt-24 border-t border-border bg-surface py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1600px] px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display reveal text-[clamp(2.2rem,6.5vw,4.6rem)]">
              El resultado
              <br />
              se nota<span className="text-acid">.</span>
            </h2>
            <p className="label-tech mt-6">Opiniones verificadas en Google</p>
          </div>

          <div className="reveal lg:col-span-8">
            <div aria-live=”polite” className=”min-h-[220px]”>
              <p className=”flex items-center gap-1” aria-label={`${review.rating} de 5 estrellas`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} aria-hidden=”true” className=”h-4 w-4 fill-foreground text-foreground” />
                ))}
                <span className=”label-tech ml-2”>{review.rating},0 / 5</span>
              </p>
              <blockquote
                key={index}
                className=”font-display mt-6 text-[clamp(1.4rem,3.4vw,2.6rem)] leading-[1.05]”
                style={{ animation: “fadeSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both” }}
              >
                “{review.quote}”
              </blockquote>
              <p
                key={`author-${index}`}
                className=”mt-6 text-sm text-muted-foreground”
                style={{ animation: “fadeSlideIn 0.4s 0.08s cubic-bezier(0.16,1,0.3,1) both” }}
              >
                — {review.author}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Opinión anterior"
                className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-border transition-colors hover:border-acid hover:text-acid"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Opinión siguiente"
                className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-border transition-colors hover:border-acid hover:text-acid"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="label-tech ml-2">
                {String(Math.min(index, reviews.length - 1) + 1).padStart(2, "0")} /{" "}
                {String(reviews.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}