import { createFileRoute } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-reveal";
import { SiteContentProvider, useSiteContent } from "@/hooks/use-site-content";
import { fetchSiteContent } from "@/lib/content";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Services } from "@/components/landing/Services";
import { Manifesto } from "@/components/landing/Manifesto";
import { Team } from "@/components/landing/Team";
import { Gallery } from "@/components/landing/Gallery";
import { Promos } from "@/components/landing/Promos";
import { Reviews } from "@/components/landing/Reviews";
import { Location } from "@/components/landing/Location";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { MobileBookingBar } from "@/components/landing/MobileBookingBar";

const TITLE = "Fidelis Studio | Barbería de autor en Mendoza";
const DESCRIPTION =
  "Precisión, estilo y ritual. Técnica precisa y atención personalizada en cada visita. Reservá tu turno en Fidelis Studio.";

export const Route = createFileRoute("/")({
  loader: () => fetchSiteContent(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
  errorComponent: () => (
    <main className="flex min-h-screen items-center justify-center bg-background p-8 text-center text-sm text-muted-foreground">
      No pudimos cargar el contenido. Actualizá la página en unos segundos.
    </main>
  ),
  notFoundComponent: () => (
    <main className="flex min-h-screen items-center justify-center bg-background p-8 text-center text-sm text-muted-foreground">
      Página no encontrada.
    </main>
  ),
});

function Index() {
  useReveal();
  const initialContent = Route.useLoaderData();

  return (
    <SiteContentProvider initialContent={initialContent}>
      <LandingPage />
    </SiteContentProvider>
  );
}

function LandingPage() {
  const { sections } = useSiteContent();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        {sections.servicios ? <Services /> : null}
        <Manifesto />
        {sections.equipo ? <Team /> : null}
        {sections.galeria ? <Gallery /> : null}
        {sections.promociones ? <Promos /> : null}
        {sections.testimonios ? <Reviews /> : null}
        <Location />
        <FinalCTA />
      </main>
      <Footer id="site-footer" />
      {sections.reservas ? (
        <>
          <MobileBookingBar hideNearId="site-footer" />
          <div aria-hidden="true" className="h-20 lg:hidden" />
        </>
      ) : null}
    </div>
  );
}
