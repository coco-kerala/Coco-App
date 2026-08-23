"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppData } from "@/hooks/useAppData";
import { getAdminMetrics } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { ClipboardList, Users, Briefcase, IndianRupee } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

export default function AdminDashboardPage() {
  const { version } = useAppData();
  const metrics = useMemo(() => getAdminMetrics(), [version]);

  const cards = [
    { label: "Unassigned", value: metrics.unassigned, icon: ClipboardList, color: "text-amber-600 bg-amber-50" },
    { label: "Assigned", value: metrics.assigned, icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
    { label: "In Progress", value: metrics.inProgress, icon: Briefcase, color: "text-orange-600 bg-orange-50" },
    { label: "Available Workers", value: metrics.availableWorkers, icon: Users, color: "text-green-600 bg-green-50" },
  ];

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-coco-ink">Dashboard</h1>
        <p className="text-sm text-coco-muted mt-1">Overview of today&apos;s operations</p>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon size={18} />
                </div>
                <p className="mt-3 text-2xl font-extrabold text-coco-ink">{c.value}</p>
                <p className="text-xs text-coco-muted font-medium">{c.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="mt-6 bg-gradient-to-r from-coco-green to-coco-green-light text-white border-0">
          <div className="flex items-center gap-3">
            <IndianRupee size={24} className="text-white/80" />
            <div>
              <p className="text-white/70 text-sm">Today&apos;s Revenue</p>
              <p className="text-3xl font-extrabold">{formatCurrency(metrics.todaysRevenue)}</p>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <Button href="/admin/requests" size="lg" fullWidth>Manage Requests</Button>
          <Button href="/admin/workers" variant="outline" size="lg" fullWidth>View Workers</Button>
        </div>
      </div>
    </PageTransition>
  );
}
