import { ExternalBookingButton } from "./ExternalBookingButton";

export function FinalCTA() {
  return (
    <section className="bg-acid text-acid-foreground">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-20 md:px-8 md:py-28">
        <h2 className="font-display max-w-4xl text-[clamp(2.2rem,7vw,6rem)]">
          Tu próximo corte
          <br />
          empieza acá.
        </h2>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <ExternalBookingButton variant="dark" size="lg" />
          <p className="max-w-xs text-sm text-acid-foreground/80">
            Elegí tu servicio y reservá desde nuestra agenda.
          </p>
        </div>
      </div>
    </section>
  );
}