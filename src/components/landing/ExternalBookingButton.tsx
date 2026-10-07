import type { ReactNode } from "react";
import { useSiteContent } from "@/hooks/use-site-content";
import { cn } from "@/lib/utils";

type Variant = "acid" | "outline" | "dark" | "bare";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  acid: "bg-acid text-acid-foreground hover:bg-[#D8D3CB] active:bg-[#C8C3BB]",
  outline:
    "border border-border text-foreground hover:border-foreground hover:text-foreground active:text-foreground",
  dark: "bg-background text-foreground hover:bg-elevated",
  bare: "text-foreground hover:text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-xs tracking-[0.14em]",
  md: "min-h-12 px-6 text-sm tracking-[0.12em]",
  lg: "min-h-14 px-8 text-sm tracking-[0.12em]",
};

export function ExternalBookingButton({
  children,
  variant = "acid",
  size = "md",
  className,
}: {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const { booking } = useSiteContent();

  return (
    <a
      href={booking.url}
      target={booking.newTab ? "_blank" : undefined}
      rel={booking.newTab ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[4px] font-medium uppercase transition-colors duration-200",
        variant !== "bare" && sizes[size],
        variants[variant],
        className,
      )}
    >
      {children ?? booking.label}
      {booking.newTab ? <span className="sr-only">(se abre en una pestaña nueva)</span> : null}
    </a>
  );
}