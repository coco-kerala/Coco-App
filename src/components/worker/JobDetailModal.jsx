"use client";

import { useMemo, useState } from "react";
import { MapPin, Trees, Phone, Navigation } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { useT } from "@/contexts/LanguageContext";
import { getJobById, getUserById, updateJobStatus } from "@/lib/data/store";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { Modal } from "@/components/ui/Modal";
import { PaymentAskCard } from "@/components/PaymentAskCard";

const STATUS_FLOW = ["assigned", "on_the_way", "arrived", "in_progress", "completed"];

const ACTION_KEYS = {
  assigned: "worker.startRoute",
  on_the_way: "worker.markArrived",
  arrived: "worker.startWork",
  in_progress: "worker.completeJob",
};

export function JobDetailModal({ onClose, jobId }) {
  const { version, refresh } = useAppData();
  const { t } = useT();
  const job = useMemo(() => (jobId ? getJobById(jobId) : null), [jobId, version]);
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState("");

  if (!jobId) return null;

  if (!job) {
    return (
      <Modal open={true} onClose={onClose} title={t("worker.jobNotFound")}>
        <p className="text-sm text-coco-muted">{t("worker.jobNotFoundDesc")}</p>
        <Button fullWidth className="mt-4" onClick={onClose}>{t("worker.close")}</Button>
      </Modal>
    );
  }

  const { request } = job;
  const partner = getUserById(job.worker_id) || request?.worker;
  const currentIdx = STATUS_FLOW.indexOf(job.status);
  const nextStatus = STATUS_FLOW[currentIdx + 1];
  const actionKey = ACTION_KEYS[job.status];
  const actionLabel = actionKey ? t(actionKey) : null;

  const advance = () => {
    if (!nextStatus) return;
    const extras = nextStatus === "completed"
      ? { photo_urls: photos, completion_notes: notes, trees_completed: request.tree_count }
      : {};
    updateJobStatus(job.id, nextStatus, extras);
    refresh();
    if (nextStatus === "completed") {
      setPhotos([]);
      setNotes("");
    }
  };

  return (
    <Modal open={true} onClose={onClose} title={t("worker.jobDetails")} className="max-h-[90vh]">
      <div className="flex items-center justify-end -mt-2 mb-3">
        <StatusBadge status={job.status} />
      </div>

      {/* Payment first — easy to show home for paying */}
      <PaymentAskCard
        amount={request.estimated_price}
        worker={partner}
        className="mb-3"
      />

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🌴</span>
          <h2 className="text-lg font-bold text-coco-ink">{t("customer.coconutPlucking")}</h2>
        </div>
        <div className="space-y-2 text-sm text-coco-muted">
          <p className="flex items-center gap-2"><Trees size={15} />{request.tree_count} {t("customer.trees")}</p>
          {request.property && (
            <div className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0" />
              <div>
                <p>{request.property.address}, {request.property.city}{request.property.state ? `, ${request.property.state}` : ""}</p>
                {request.property.latitude != null && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${request.property.latitude},${request.property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coco-leaf-soft text-base font-bold text-coco-green"
                  >
                    <Navigation size={18} /> {t("worker.openMaps")}
                  </a>
                )}
              </div>
            </div>
          )}
          <p className="text-coco-ink font-medium">{formatDate(request.preferred_date)} · {formatTime(request.preferred_time)}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-coco-border flex items-center justify-between">
          <span className="text-sm text-coco-muted">{t("worker.earning")}</span>
          <span className="text-xl font-extrabold text-coco-green">{formatCurrency(request.estimated_price)}</span>
        </div>
      </Card>

      {request.customer && (
        <Card className="mt-3">
          <p className="text-xs font-bold text-coco-muted uppercase tracking-wide mb-2">{t("worker.customerLabel")}</p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-coco-cream text-coco-ink flex items-center justify-center font-bold text-sm">
              {request.customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-coco-ink">{request.customer.name}</p>
              <p className="text-sm text-coco-muted">{request.customer.phone}</p>
            </div>
            <a href={`tel:${request.customer.phone}`} className="h-12 w-12 rounded-full bg-coco-green text-white flex items-center justify-center shrink-0">
              <Phone size={22} />
            </a>
          </div>
        </Card>
      )}

      {job.status === "in_progress" && (
        <Card className="mt-3">
          <p className="text-xs font-bold text-coco-muted uppercase tracking-wide mb-3">{t("worker.completionPhotos")}</p>
          <PhotoUploader photos={photos} onChange={setPhotos} />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("worker.addNotes")}
            className="mt-3 w-full h-16 rounded-xl border border-coco-border bg-coco-cream px-3 py-2 text-sm resize-none"
          />
        </Card>
      )}

      {job.status === "completed" && (
        <Card className="mt-3 bg-emerald-50 border-emerald-200">
          <p className="text-center text-base font-bold text-emerald-700">{t("worker.jobCompleted")}</p>
          <p className="text-center text-sm text-emerald-600 mt-1">{t("worker.waitingConfirm")}</p>
        </Card>
      )}

      {actionLabel && (
        <Button fullWidth size="lg" className="mt-4 h-14 text-lg" onClick={advance}>
          {job.status === "assigned" && <Navigation size={20} />}
          {actionLabel}
        </Button>
      )}

      <Button variant="outline" fullWidth className="mt-2 h-12 text-base" onClick={onClose}>{t("worker.close")}</Button>
    </Modal>
  );
}
