"use client";

import { useMemo } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getAllProperties, getUserById } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { MapPin, Trees } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

export default function AdminPropertiesPage() {
  const { version } = useAppData();
  const properties = useMemo(() => getAllProperties().map((p) => ({ ...p, customer: getUserById(p.customer_id) })), [version]);

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">Properties</h1>
        <p className="text-sm text-coco-muted mt-1">{properties.length} properties</p>

        <div className="mt-5 space-y-3">
          {properties.map((p) => (
            <Card key={p.id}>
              <h3 className="font-bold text-coco-ink">{p.name}</h3>
              <p className="text-sm text-coco-muted mt-1 flex items-center gap-1"><MapPin size={13} />{p.address}, {p.city}</p>
              <p className="text-sm text-coco-muted flex items-center gap-1"><Trees size={13} />{p.tree_count} trees</p>
              {p.customer && <p className="text-sm text-coco-muted mt-1">Owner: {p.customer.name}</p>}
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
