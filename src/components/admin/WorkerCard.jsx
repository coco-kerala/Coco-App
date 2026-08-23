import { MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function WorkerCard({ worker, onAssign, showAssign, className }) {
  return (
    <Card className={cn(className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-coco-leaf-soft text-coco-green flex items-center justify-center font-bold text-sm">
            {worker.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-coco-ink">{worker.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {worker.rating && (
                <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 font-semibold">
                  <Star size={12} className="fill-amber-400 text-amber-400" />{worker.rating}
                </span>
              )}
              {worker.distance !== undefined && (
                <span className="text-xs text-coco-muted flex items-center gap-0.5"><MapPin size={11} />{worker.distance} km</span>
              )}
            </div>
          </div>
        </div>
        <StatusBadge status={worker.availability || worker.location?.status || "available"} />
      </div>
      {showAssign && (
        <Button size="sm" fullWidth className="mt-3" onClick={() => onAssign?.(worker.id)}>
          Assign Worker
        </Button>
      )}
    </Card>
  );
}
