"use client";

import { cn } from "@/lib/utils";
import { CoconutTreeIllustration } from "@/components/brand/CoconutTreeIllustration";
import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  navTo,
  navParams,
  className,
  compact,
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "py-8 px-4" : "py-14 px-6", className)}>
      <CoconutTreeIllustration className={compact ? "w-24 h-24" : "w-36 h-36"} />
      <h3 className="mt-5 text-lg font-bold text-coco-ink">{title}</h3>
      {description && <p className="mt-2 text-sm text-coco-muted max-w-[260px] leading-relaxed">{description}</p>}
      {actionLabel && navTo && (
        <Button className="mt-6" navTo={navTo} navParams={navParams}>{actionLabel}</Button>
      )}
      {actionLabel && actionHref && !navTo && (
        <Button className="mt-6" href={actionHref}>{actionLabel}</Button>
      )}
      {actionLabel && onAction && !actionHref && !navTo && (
        <Button className="mt-6" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
