"use client";

import { QueryNavForm } from "@/components/QueryNavForm";
import { useT } from "@/contexts/LanguageContext";
import { MapPin, Trees, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatTime, cn } from "@/lib/utils";

export function JobCard({ job, className }) {
  const { t } = useT();
  const { request } = job;

  return (
    <QueryNavForm action="/partner" params={{ job: job.id }} className="block w-full">
      <button type="submit" className="block w-full text-left border-0 bg-transparent p-0 cursor-pointer">
        <Card hover className={cn(className)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🌴</span>
                <h3 className="font-bold text-coco-ink">{t("customer.coconutPlucking")}</h3>
              </div>
              <div className="mt-2 space-y-1.5 text-sm text-coco-muted">
                <p className="inline-flex items-center gap-1.5"><Trees size={14} />{request?.tree_count ?? 0} {t("customer.trees")}</p>
                {request?.property && <p className="flex items-center gap-1.5"><MapPin size={14} />{request.property.address}</p>}
                {request?.preferred_time && <p className="flex items-center gap-1.5"><Clock size={14} />{formatTime(request.preferred_time)}</p>}
              </div>
            </div>
            <div className="text-right">
              <StatusBadge status={job.status} />
              <p className="mt-3 text-lg font-bold text-coco-ink">{formatCurrency(request?.estimated_price ?? 0)}</p>
            </div>
          </div>
          <div className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-coco-leaf-soft text-coco-green font-semibold text-[15px]">
            {t("worker.viewJob")} <ChevronRight size={16} />
          </div>
        </Card>
      </button>
    </QueryNavForm>
  );
}
