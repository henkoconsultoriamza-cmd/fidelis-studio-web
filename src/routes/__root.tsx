import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useScrollProgress } from "@/hooks/use-scroll-effects";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Fidelis Studio | Barbería de autor en Mendoza" },
      {
        name: "description",
        content:
          "Precisión, estilo y ritual. Técnica precisa y atención personalizada en cada visita.",
      },
      { name: "author", content: "Fidelis Studio" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Fidelis Studio | Barbería de autor en Mendoza" },
      { property: "og:description", content: "Precisión, estilo y ritual. Técnica precisa y atención personalizada en cada visita." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://fidelis-studio-web.vercel.app" },
      { property: "og:image", content: "https://fidelis-studio-web.vercel.app/img/og-image.jpg" },
      { property: "og:locale", content: "es_AR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Fidelis Studio | Barbería de autor en Mendoza" },
      { name: "twitter:description", content: "Precisión, estilo y ritual. Técnica precisa y atención personalizada en cada visita." },
    ],
    links: [
      { rel: "canonical", href: "https://fidelis-studio-web.vercel.app" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@100;300;400;600&family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "name": "Fidelis Studio",
  "description": "Barberia de autor en Las Heras, Mendoza. Precision, estilo y ritual.",
  "url": "https://fidelis-studio-web.vercel.app",
  "telephone": "+5492616686085",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Patricias Mendocinas 826",
    "addressLocality": "Las Heras",
    "addressRegion": "Mendoza",
    "addressCountry": "AR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -32.8549214,
    "longitude": -68.8446197
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "14:00", "closes": "20:00" }
  ],
  "sameAs": ["https://www.instagram.com/f.idelis_studio"]
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useScrollProgress();

  return (
    <QueryClientProvider client={queryClient}>
      <div id="scroll-progress" aria-hidden="true" />
      <Outlet />
    </QueryClientProvider>
  );
}
