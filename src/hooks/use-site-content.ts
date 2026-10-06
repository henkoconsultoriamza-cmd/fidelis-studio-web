import { useQuery } from "@tanstack/react-query";
import { createContext, createElement, useContext, type ReactNode } from "react";
import { FALLBACK_CONTENT, fetchSiteContent, type SiteContent } from "@/lib/content";

export const siteContentQuery = {
  queryKey: ["site-content"] as const,
  queryFn: fetchSiteContent,
  staleTime: 5_000,
  refetchInterval: 15_000,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true,
  refetchOnMount: "always" as const,
  retry: 1,
};

const InitialSiteContentContext = createContext<SiteContent | null>(null);

export function SiteContentProvider({
  initialContent,
  children,
}: {
  initialContent: SiteContent;
  children: ReactNode;
}) {
  return createElement(InitialSiteContentContext.Provider, { value: initialContent }, children);
}

/**
 * Contenido editable del sitio. Si todavía no hay datos (o falla la consulta)
 * se usa el contenido estático para que la página nunca quede vacía.
 */
export function useSiteContent(): SiteContent {
  const initialContent = useContext(InitialSiteContentContext);
  const { data } = useQuery({
    ...siteContentQuery,
    initialData: initialContent ?? FALLBACK_CONTENT,
  });
  return data;
}