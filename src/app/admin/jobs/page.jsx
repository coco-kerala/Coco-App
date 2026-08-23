"use client";

import { useMemo } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getJobsByWorker, getWorkers } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";

export default function AdminJobsPage() {
  const { version } = useAppData();
  const workers = useMemo(() => getWorkers(), [version]);
  const allJobs = useMemo(() => workers.flatMap((w) => getJobsByWorker(w.id)), [workers, version]);

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">All Jobs</h1>
        <p className="text-sm text-coco-muted mt-1">{allJobs.length} jobs</p>

        <div className="mt-5 space-y-3">
          {allJobs.map((j) => (
            <Card key={j.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-coco-ink">{j.request?.customer?.name || "Customer"}</p>
                  <p className="text-sm text-coco-muted">{j.request?.tree_count} Trees · {formatDate(j.request?.preferred_date)}</p>
                  <p className="text-sm text-coco-muted mt-1">Worker: {j.request?.worker?.name || "—"}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={j.status} />
                  <p className="mt-2 text-sm font-bold text-coco-ink">{formatCurrency(j.request?.estimated_price || 0)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
