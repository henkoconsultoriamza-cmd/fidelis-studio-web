import { useEffect, useRef } from "react";

export function useHeroScroll() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const height = el.offsetHeight;
        const progress = Math.min(scrollY / height, 1); // 0 → 1

        // Parallax en la imagen
        const img = el.querySelector<HTMLElement>("[data-parallax]");
        if (img) img.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;

        // Clip-path: la imagen se "encoge" hacia el centro al scrollear
        const inset = progress * 6; // hasta 6% de inset
        const radius = progress * 24; // border-radius creciente
        el.style.clipPath = `inset(${inset}% ${inset * 0.6}% ${inset * 0.3}% ${inset * 0.6}% round ${radius}px)`;

        // Scale sutil
        el.style.transform = `scale(${1 - progress * 0.04})`;

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return ref;
}

export function useScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        bar.style.width = `${pct}%`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
