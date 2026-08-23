import { cn } from "@/lib/utils";

const sizeMap = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" };

export function Logo({ size = "md", className }) {
  return (
    <div className={cn("font-extrabold tracking-tight text-coco-green flex items-center gap-1.5", sizeMap[size], className)}>
      <span className="text-[1.1em]">🥥</span>
      <span>COCO</span>
    </div>
  );
}
