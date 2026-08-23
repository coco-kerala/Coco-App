"use client";

import { useMemo } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getCustomers, getPropertiesByCustomer, getRequestsByCustomer } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { PageTransition } from "@/components/PageTransition";

export default function AdminCustomersPage() {
  const { version } = useAppData();
  const customers = useMemo(() => getCustomers().map((c) => ({
    ...c,
    properties: getPropertiesByCustomer(c.id).length,
    requests: getRequestsByCustomer(c.id).length,
  })), [version]);

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">Customers</h1>
        <p className="text-sm text-coco-muted mt-1">{customers.length} customers</p>

        <div className="mt-5 space-y-3">
          {customers.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-coco-cream text-coco-ink flex items-center justify-center font-bold text-sm">
                  {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-coco-ink">{c.name}</h3>
                  <p className="text-sm text-coco-muted">{c.phone}</p>
                </div>
                <div className="text-right text-sm text-coco-muted">
                  <p>{c.properties} properties</p>
                  <p>{c.requests} requests</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
