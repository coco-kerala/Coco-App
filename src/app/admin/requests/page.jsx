"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getAllRequests, getAvailableWorkersForRequest, assignWorker, cancelRequest, updateRequestPrice, rescheduleRequest } from "@/lib/data/store";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { WorkerCard } from "@/components/admin/WorkerCard";
import { PageTransition } from "@/components/PageTransition";

export default function AdminRequestsPage() {
  const { version, refresh } = useAppData();
  const requests = useMemo(() => getAllRequests(), [version]);
  const [selectedId, setSelectedId] = useState(null);
  const [showAssign, setShowAssign] = useState(false);

  const selected = requests.find((r) => r.id === selectedId);
  const workers = useMemo(() => selectedId ? getAvailableWorkersForRequest(selectedId) : [], [selectedId, version]);

  const handleAssign = (workerId) => {
    assignWorker(selectedId, workerId);
    setShowAssign(false);
    setSelectedId(null);
    refresh();
  };

  const handleCancel = (id) => {
    cancelRequest(id);
    refresh();
  };

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">Requests</h1>
        <p className="text-sm text-coco-muted mt-1">{requests.length} total requests</p>

        <div className="mt-5 space-y-3">
          {requests.map((r) => (
            <Card key={r.id} hover onClick={() => setSelectedId(r.id)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span>🌴</span>
                    <span className="font-bold text-coco-ink">{r.customer?.name || "Customer"}</span>
                  </div>
                  <p className="mt-1 text-sm text-coco-muted">{r.tree_count} Trees · {formatDate(r.preferred_date)} · {formatTime(r.preferred_time)}</p>
                  {r.property && <p className="text-sm text-coco-muted">{r.property.address}</p>}
                  {r.worker && <p className="mt-1 text-sm text-coco-ink font-medium">Worker: {r.worker.name}</p>}
                </div>
                <div className="text-right space-y-1">
                  <StatusBadge status={r.status} />
                  <p className="text-sm font-bold text-coco-ink">{formatCurrency(r.estimated_price)}</p>
                </div>
              </div>
              {r.status === "unassigned" && (
                <Button size="sm" fullWidth className="mt-3" onClick={(e) => { e.stopPropagation(); setSelectedId(r.id); setShowAssign(true); }}>
                  Assign Worker
                </Button>
              )}
              {["unassigned", "assigned"].includes(r.status) && (
                <Button size="sm" variant="ghost" fullWidth className="mt-1 text-red-500" onClick={(e) => { e.stopPropagation(); handleCancel(r.id); }}>
                  Cancel
                </Button>
              )}
            </Card>
          ))}
        </div>

        <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Worker">
          {selected && (
            <div>
              <p className="text-sm text-coco-muted mb-4">For: {selected.customer?.name} — {selected.tree_count} trees at {selected.property?.address}</p>
              <div className="space-y-3">
                {workers.map((w) => <WorkerCard key={w.id} worker={w} showAssign onAssign={handleAssign} />)}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
}
