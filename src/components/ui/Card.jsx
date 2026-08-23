import { cn } from "@/lib/utils";

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({ children, className, hover, padding = "md", onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-coco-border bg-white shadow-[var(--shadow-card)] transition-all duration-200",
        hover && "hover:border-coco-green/40 hover:shadow-md active:scale-[0.98] cursor-pointer",
        paddings[padding] ?? paddings.md,
        className
      )}
    >
      {children}
    </div>
  );
}
