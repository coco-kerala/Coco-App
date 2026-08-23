"use client";

import { Calendar, ChevronRight, Trees } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Go } from "@/components/Go";
import { formatCurrency, formatDate, formatTime, cn } from "@/lib/utils";

export function RequestCard({ request, href, className }) {
  const { t } = useT();

  const body = (
    <Card hover={!!href} className={cn(className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌴</span>
            <h3 className="font-bold text-coco-ink">{t("customer.coconutPlucking")}</h3>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-coco-muted">
            <span className="inline-flex items-center gap-1"><Trees size={14} />{request.tree_count} {t("customer.trees")}</span>
            <span className="inline-flex items-center gap-1"><Calendar size={14} />{formatDate(request.preferred_date)} · {formatTime(request.preferred_time)}</span>
          </div>
          {request.worker && <p className="mt-2 text-sm text-coco-ink"><span className="text-coco-muted">{t("worker.workerLabel")} · </span>{request.worker.name}</p>}
          {request.property && <p className="mt-1 text-sm text-coco-muted">{request.property.address}, {request.property.city}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={request.status} />
          <span className="text-sm font-bold text-coco-ink">{formatCurrency(request.final_price ?? request.estimated_price)}</span>
          {href && <ChevronRight size={18} className="text-coco-muted" />}
        </div>
      </div>
    </Card>
  );

  if (!href) return body;
  return <Go href={href} className="block w-full">{body}</Go>;
}
