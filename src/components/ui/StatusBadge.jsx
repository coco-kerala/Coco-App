"use client";

import { useT } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const statusColors = {
  new: "bg-blue-100 text-blue-700",
  unassigned: "bg-amber-100 text-amber-700",
  assigned: "bg-indigo-100 text-indigo-700",
  on_the_way: "bg-sky-100 text-sky-700",
  arrived: "bg-cyan-100 text-cyan-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-emerald-100 text-emerald-700",
  available: "bg-green-100 text-green-700",
  busy: "bg-red-100 text-red-700",
  working: "bg-orange-100 text-orange-700",
  en_route: "bg-sky-100 text-sky-700",
};

export function StatusBadge({ status, className }) {
  const { t } = useT();
  const color = statusColors[status] || "bg-gray-100 text-gray-700";
  const label = t(`status.${status}`) !== `status.${status}` ? t(`status.${status}`) : status;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", color, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {label}
    </span>
  );
}
