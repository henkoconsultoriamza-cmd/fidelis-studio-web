import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const s = {
    sm: { name: "text-xl",   sub: "text-[0.5rem]",  arc: "w-20", gap: "gap-[5px]"  },
    md: { name: "text-3xl",  sub: "text-[0.6rem]",  arc: "w-28", gap: "gap-[6px]"  },
    lg: { name: "text-5xl",  sub: "text-[0.75rem]", arc: "w-40", gap: "gap-[8px]"  },
  }[size];

  return (
    <span className={cn("inline-flex flex-col items-center leading-none select-none", s.gap, className)}>
      <span className={cn("tracking-[0.22em] text-foreground uppercase font-normal", s.name)} style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
        FIDELIS
      </span>
      <svg aria-hidden="true" viewBox="0 0 120 6" className={cn("text-foreground/50", s.arc)} fill="none">
        <path d="M2 5 Q60 1 118 5" stroke="currentColor" strokeWidth="0.8" />
      </svg>
      <span className={cn("tracking-[0.45em] text-foreground/60 uppercase font-light", s.sub)} style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
        STUDIO
      </span>
    </span>
  );
}
