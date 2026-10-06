export function Seal({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="relative flex h-full w-full items-center justify-center rounded-full border border-acid/40 bg-background/70 backdrop-blur-sm">
        <svg viewBox="0 0 100 100" className="animate-seal h-full w-full">
          <defs>
            <path
              id="seal-circle"
              d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
              fill="none"
            />
          </defs>
          <text
            fill="#F5F5F5"
            fontSize="7.4"
            letterSpacing="2.6"
            fontFamily="Inter, sans-serif"
          >
            <textPath href="#seal-circle" startOffset="0">
              FIDELIS · STUDIO · MENDOZA ·
            </textPath>
          </text>
        </svg>
        <span className="absolute h-2.5 w-2.5 rounded-full bg-acid" />
      </div>
    </div>
  );
}