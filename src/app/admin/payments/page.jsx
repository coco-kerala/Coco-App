"use client";

import { useMemo } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getAllPayments } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";

export default function AdminPaymentsPage() {
  const { version } = useAppData();
  const payments = useMemo(() => getAllPayments(), [version]);

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">Payments</h1>

        <Card className="mt-5 bg-coco-green text-white border-0">
          <p className="text-white/70 text-sm">Total Collected</p>
          <p className="text-3xl font-extrabold">{formatCurrency(totalPaid)}</p>
        </Card>

        <div className="mt-5 space-y-3">
          {payments.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-coco-ink">{formatCurrency(p.amount)}</p>
                  <p className="text-sm text-coco-muted">{p.payment_method || "Pending"} {p.paid_at ? `· ${new Date(p.paid_at).toLocaleDateString()}` : ""}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
