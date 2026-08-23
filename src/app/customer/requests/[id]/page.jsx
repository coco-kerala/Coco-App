"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useUnwrapParams } from "@/lib/params";
import { getRequestById, confirmAndRate, cancelRequest } from "@/lib/data/store";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressTimeline } from "@/components/ui/ProgressTimeline";
import { Rating } from "@/components/ui/Rating";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageTransition } from "@/components/PageTransition";

export default function RequestDetailPage({ params }) {
  const { id } = useUnwrapParams(params);
  const router = useRouter();
  const { user } = useAuth();
  const { version, refresh } = useAppData();
  const request = useMemo(() => getRequestById(id), [id, version]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  if (!request) {
    return (
      <div className="px-5 pt-6">
        <p className="text-coco-muted">Request not found.</p>
        <Button href="/customer/requests" className="mt-4">Back to requests</Button>
      </div>
    );
  }

  const handleConfirm = () => {
    confirmAndRate({ request_id: request.id, customer_id: user.id, rating, comment });
    refresh();
  };

  const handleCancel = () => {
    cancelRequest(request.id);
    refresh();
  };

  return (
    <PageTransition>
      <div className="px-5 pt-6 pb-8">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-coco-muted mb-4">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-coco-ink">Request Details</h1>
          <StatusBadge status={request.status} />
        </div>

        <Card className="mt-5 space-y-3">
          <Row label="Service" value="Coconut Plucking 🌴" />
          <Row label="Trees" value={`${request.tree_count} trees`} />
          <Row label="Date" value={`${formatDate(request.preferred_date)} · ${formatTime(request.preferred_time)}`} />
          {request.property && <Row label="Location" value={`${request.property.address}, ${request.property.city}`} />}
          <div className="border-t border-coco-border pt-3 flex items-center justify-between">
            <span className="text-sm text-coco-muted">Price</span>
            <span className="text-xl font-extrabold text-coco-ink">{formatCurrency(request.final_price ?? request.estimated_price)}</span>
          </div>
        </Card>

        {request.worker && (
          <Card className="mt-4">
            <p className="text-xs font-bold text-coco-muted uppercase tracking-wide mb-2">Worker</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-coco-leaf-soft text-coco-green flex items-center justify-center font-bold text-sm">
                {request.worker.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-coco-ink">{request.worker.name}</p>
                <p className="text-sm text-coco-muted">{request.worker.phone}</p>
              </div>
              <a href={`tel:${request.worker.phone}`} className="h-9 w-9 rounded-full bg-coco-green text-white flex items-center justify-center">
                <Phone size={16} />
              </a>
            </div>
          </Card>
        )}

        <Card className="mt-4">
          <p className="text-xs font-bold text-coco-muted uppercase tracking-wide mb-3">Progress</p>
          <ProgressTimeline currentStatus={request.status} />
        </Card>

        {request.status === "completed" && !request.review && (
          <Card className="mt-4">
            <p className="text-xs font-bold text-coco-muted uppercase tracking-wide mb-3">Rate & Confirm</p>
            <div className="flex justify-center mb-3">
              <Rating value={rating} onChange={setRating} size={32} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment (optional)"
              className="w-full h-20 rounded-xl border border-coco-border bg-coco-cream px-3 py-2 text-sm resize-none"
            />
            <Button fullWidth className="mt-3" onClick={handleConfirm}>Confirm & Pay</Button>
          </Card>
        )}

        {["unassigned", "assigned"].includes(request.status) && (
          <Button variant="outline" fullWidth className="mt-4 text-red-500 border-red-200 hover:bg-red-50" onClick={() => setShowCancel(true)}>
            Cancel Request
          </Button>
        )}

        <ConfirmDialog open={showCancel} onClose={() => setShowCancel(false)} onConfirm={handleCancel} title="Cancel Request?" message="Are you sure you want to cancel this request?" confirmLabel="Yes, cancel" />
      </div>
    </PageTransition>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-coco-muted">{label}</span>
      <span className="text-sm font-semibold text-coco-ink text-right">{value}</span>
    </div>
  );
}
