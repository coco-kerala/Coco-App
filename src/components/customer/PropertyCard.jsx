"use client";

import { MapPin, Trees, Check } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function PropertyCard({ property, selected, onSelect }) {
  const { t } = useT();

  return (
    <Card
      hover
      onClick={onSelect}
      className={cn(selected && "ring-2 ring-coco-green border-coco-green")}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-coco-ink">{property.name}</h3>
          <p className="mt-1 text-sm text-coco-muted flex items-center gap-1"><MapPin size={13} />{property.address}, {property.city}</p>
          <p className="mt-1 text-sm text-coco-muted flex items-center gap-1"><Trees size={13} />{property.tree_count} {t("customer.trees")}</p>
        </div>
        {selected && (
          <div className="h-6 w-6 rounded-full bg-coco-green text-white flex items-center justify-center">
            <Check size={14} strokeWidth={3} />
          </div>
        )}
      </div>
    </Card>
  );
}
