"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value = 0, onChange, size = 24, readonly }) {
  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn("transition-transform duration-150", !readonly && "hover:scale-125 active:scale-95 cursor-pointer", readonly && "cursor-default")}
        >
          <Star
            size={size}
            className={star <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-coco-border"}
          />
        </button>
      ))}
    </div>
  );
}
