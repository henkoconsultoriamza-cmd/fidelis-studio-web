import { cn } from "@/lib/utils";
import isotipoSrc from "@/assets/fidelis-isotipo.png";

const sizes = {
  sm: "h-8",
  md: "h-11",
  lg: "h-16",
};

export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <img
      src={isotipoSrc}
      alt="Fidelis Studio"
      className={cn("w-auto object-contain select-none", sizes[size], className)}
      draggable={false}
    />
  );
}
