"use client";

import { useMemo } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getAdminMetrics, getAllRequests } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";

export default function AdminReportsPage() {
  const { version } = useAppData();
  const metrics = useMemo(() => getAdminMetrics(), [version]);
  const requests = useMemo(() => getAllRequests(), [version]);

  const completed = requests.filter((r) => ["completed", "confirmed"].includes(r.status)).length;
  const cancelled = requests.filter((r) => r.status === "cancelled").length;

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">Reports</h1>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Card><p className="text-sm text-coco-muted">Total Requests</p><p className="text-2xl font-extrabold text-coco-ink mt-1">{requests.length}</p></Card>
          <Card><p className="text-sm text-coco-muted">Completed</p><p className="text-2xl font-extrabold text-emerald-600 mt-1">{completed}</p></Card>
          <Card><p className="text-sm text-coco-muted">Cancelled</p><p className="text-2xl font-extrabold text-red-500 mt-1">{cancelled}</p></Card>
          <Card><p className="text-sm text-coco-muted">Revenue</p><p className="text-2xl font-extrabold text-coco-ink mt-1">{formatCurrency(metrics.todaysRevenue)}</p></Card>
        </div>
      </div>
    </PageTransition>
  );
}
