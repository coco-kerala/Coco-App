"use client";

import { useMemo } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getWorkers } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";

export default function AdminWorkersPage() {
  const { version } = useAppData();
  const workers = useMemo(() => getWorkers(), [version]);

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">Workers</h1>
        <p className="text-sm text-coco-muted mt-1">{workers.length} registered workers</p>

        <div className="mt-5 space-y-3">
          {workers.map((w) => (
            <Card key={w.id}>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-coco-leaf-soft text-coco-green flex items-center justify-center font-bold text-sm">
                  {w.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-coco-ink">{w.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5 text-sm text-coco-muted">
                    {w.rating && <span className="inline-flex items-center gap-0.5"><Star size={12} className="fill-amber-400 text-amber-400" />{w.rating}</span>}
                    <span>Jobs today: {w.jobsToday}</span>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={w.location?.status || "available"} />
                  <p className="mt-1 text-sm font-bold text-coco-ink">{formatCurrency(w.earnings)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
