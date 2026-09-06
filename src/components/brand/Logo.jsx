import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

/**
 * KeraGo wordmark only (like Snabbit / Fiverr) — no icon.
 * Kera = coconut shell brown, Go = coconut leaf green.
 */
export function Logo({ size = "md", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-brand font-bold tracking-tight leading-none select-none",
        sizeMap[size] || sizeMap.md,
        className
      )}
      aria-label="KeraGo"
    >
      <span className="text-coco-shell">Kera</span>
      <span className="text-coco-leaf">Go</span>
    </span>
  );
}
