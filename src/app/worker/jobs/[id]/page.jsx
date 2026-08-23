"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Trees, Phone, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useUnwrapParams } from "@/lib/params";
import { getJobById, updateJobStatus } from "@/lib/data/store";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { PageTransition } from "@/components/PageTransition";

const STATUS_FLOW = ["assigned", "on_the_way", "arrived", "in_progress", "completed"];
const ACTION_LABELS = { assigned: "Start Route", on_the_way: "Mark Arrived", arrived: "Start Work", in_progress: "Complete Job" };

export default function JobDetailPage({ params }) {
  const { id } = useUnwrapParams(params);
  const router = useRouter();
  const { version, refresh } = useAppData();
  const job = useMemo(() => getJobById(id), [id, version]);
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState("");

  if (!job) {
    return (
      <div className="px-5 pt-6">
        <p className="text-coco-muted">Job not found.</p>
        <Button href="/worker" className="mt-4">Back to jobs</Button>
      </div>
    );
  }

  const { request } = job;
  const currentIdx = STATUS_FLOW.indexOf(job.status);
  const nextStatus = STATUS_FLOW[currentIdx + 1];
  const actionLabel = ACTION_LABELS[job.status];

  const advance = () => {
    if (!nextStatus) return;
    const extras = nextStatus === "completed" ? { photo_urls: photos, completion_notes: notes, trees_completed: request.tree_count } : {};
    updateJobStatus(job.id, nextStatus, extras);
    refresh();
  };

  return (
    <PageTransition>
      <div className="px-5 pt-6 pb-8">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-coco-muted mb-4">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-coco-ink">Job Details</h1>
          <StatusBadge status={job.status} />
        </div>

        <Card className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌴</span>
            <h2 className="text-lg font-bold text-coco-ink">Coconut Plucking</h2>
          </div>
          <div className="space-y-2 text-sm text-coco-muted">
            <p className="flex items-center gap-2"><Trees size={15} />{request.tree_count} Trees</p>
            {request.property && <p className="flex items-center gap-2"><MapPin size={15} />{request.property.address}, {request.property.city}</p>}
            <p className="text-coco-ink font-medium">{formatDate(request.preferred_date)} · {formatTime(request.preferred_time)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-coco-border flex items-center justify-between">
            <span className="text-sm text-coco-muted">Earning</span>
            <span className="text-xl font-extrabold text-coco-green">{formatCurrency(request.estimated_price)}</span>
          </div>
        </Card>

        {request.customer && (
          <Card className="mt-4">
            <p className="text-xs font-bold text-coco-muted uppercase tracking-wide mb-2">Customer</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-coco-cream text-coco-ink flex items-center justify-center font-bold text-sm">
                {request.customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-coco-ink">{request.customer.name}</p>
                <p className="text-sm text-coco-muted">{request.customer.phone}</p>
              </div>
              <a href={`tel:${request.customer.phone}`} className="h-9 w-9 rounded-full bg-coco-green text-white flex items-center justify-center">
                <Phone size={16} />
              </a>
            </div>
          </Card>
        )}

        {job.status === "in_progress" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mt-4">
              <p className="text-xs font-bold text-coco-muted uppercase tracking-wide mb-3">Completion Photos</p>
              <PhotoUploader photos={photos} onChange={setPhotos} />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes (optional)" className="mt-3 w-full h-16 rounded-xl border border-coco-border bg-coco-cream px-3 py-2 text-sm resize-none" />
            </Card>
          </motion.div>
        )}

        {job.status === "completed" && (
          <Card className="mt-4 bg-emerald-50 border-emerald-200">
            <p className="text-center text-lg font-bold text-emerald-700">✓ Job Completed!</p>
            <p className="text-center text-sm text-emerald-600 mt-1">Well done. Waiting for customer confirmation.</p>
          </Card>
        )}

        {actionLabel && (
          <Button fullWidth size="lg" className="mt-6" onClick={advance}>
            {job.status === "assigned" && <Navigation size={18} />}
            {actionLabel}
          </Button>
        )}
      </div>
    </PageTransition>
  );
}
