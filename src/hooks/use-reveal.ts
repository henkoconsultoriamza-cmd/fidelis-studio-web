import { useEffect } from "react";

/**
 * Aparición suave al entrar en viewport. Respeta prefers-reduced-motion vía CSS.
 * Observa también los elementos que se agregan después del montaje (contenido
 * que llega desde la base de datos), para que nunca queden en opacidad 0.
 */
export function useReveal() {
  useEffect(() => {
    const showAll = () =>
      document.querySelectorAll<HTMLElement>(".reveal, .reveal-left, .reveal-line").forEach((n) => n.classList.add("is-visible"));


    if (typeof IntersectionObserver === "undefined" || typeof MutationObserver === "undefined") {
      showAll();
      return;
    }

    const seen = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const register = (root: ParentNode | Element) => {
      const nodes: Element[] = [];
      if (root instanceof Element && (root.classList.contains("reveal") || root.classList.contains("reveal-left") || root.classList.contains("reveal-line"))) nodes.push(root);
      root.querySelectorAll?.(".reveal, .reveal-left, .reveal-line").forEach((n) => nodes.push(n));
      nodes.forEach((node) => {
        if (seen.has(node) || node.classList.contains("is-visible")) return;
        seen.add(node);
        observer.observe(node);
      });
    };

    register(document);

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === 1) register(node as Element);
        });
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);
}