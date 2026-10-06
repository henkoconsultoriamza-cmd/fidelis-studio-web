const ITEMS = ["Corte", "Barba", "Estilo", "Ritual", "Fidelis"];

function Row() {
  return (
    <span className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="font-display px-6 text-[clamp(1.6rem,4vw,3.2rem)] whitespace-nowrap">
            {item}
          </span>
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-acid" />
        </span>
      ))}
    </span>
  );
}

export function Marquee() {
  return (
    <div
      className="group border-y border-border bg-surface py-5 overflow-hidden"
      aria-hidden="true"
    >
      <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
        <Row />
        <Row />
        <Row />
        <Row />
      </div>
    </div>
  );
}