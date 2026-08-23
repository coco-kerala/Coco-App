import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "unassigned", label: "Request Placed" },
  { key: "assigned", label: "Worker Assigned" },
  { key: "on_the_way", label: "On the Way" },
  { key: "arrived", label: "Arrived" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "confirmed", label: "Confirmed & Paid" },
];

export function ProgressTimeline({ currentStatus }) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-300 shrink-0",
                done ? "bg-coco-green scale-100" : "bg-coco-border scale-90"
              )}>
                {done ? <Check size={14} strokeWidth={3} /> : <span className="text-white/70">{i + 1}</span>}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-0.5 h-6 transition-colors duration-300", i < currentIdx ? "bg-coco-green" : "bg-coco-border")} />
              )}
            </div>
            <div className="pt-1">
              <p className={cn("text-sm font-semibold", isCurrent ? "text-coco-green" : done ? "text-coco-ink" : "text-coco-muted")}>
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
