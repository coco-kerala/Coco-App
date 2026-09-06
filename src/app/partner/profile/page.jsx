"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useT } from "@/contexts/LanguageContext";
import { getJobsByWorker } from "@/lib/data/store";
import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { InstallAppButton } from "@/components/AddToHomeScreen";
import { Star, Briefcase, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";

export default function WorkerProfilePage() {
  const { user } = useAuth();
  const { version } = useAppData();
  const { t } = useT();
  const jobs = useMemo(() => getJobsByWorker(user.id), [user.id, version]);
  const completed = jobs.filter((j) => j.status === "completed");
  const earnings = completed.reduce((sum, j) => sum + (j.request?.estimated_price ?? 0), 0);

  return (
    <PageTransition>
      <div className="px-5 pt-6">
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-coco-leaf-soft text-coco-green flex items-center justify-center text-2xl font-bold">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <h2 className="mt-3 text-xl font-bold text-coco-ink">{user.name}</h2>
          <p className="text-sm text-coco-muted">{t("worker.workerLabel")}</p>
          {user.rating && (
            <div className="mt-1 flex items-center gap-1 text-amber-600 font-semibold text-sm">
              <Star size={14} className="fill-amber-400 text-amber-400" /> {user.rating}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Card className="text-center">
            <Briefcase size={20} className="mx-auto text-coco-green" />
            <p className="mt-1 text-2xl font-extrabold text-coco-ink">{jobs.length}</p>
            <p className="text-[11px] text-coco-muted font-medium">{t("profile.total")}</p>
          </Card>
          <Card className="text-center">
            <CheckCircle size={20} className="mx-auto text-emerald-500" />
            <p className="mt-1 text-2xl font-extrabold text-coco-ink">{completed.length}</p>
            <p className="text-[11px] text-coco-muted font-medium">{t("profile.done")}</p>
          </Card>
          <Card className="text-center">
            <span className="text-lg">💰</span>
            <p className="mt-1 text-lg font-extrabold text-coco-ink">{formatCurrency(earnings)}</p>
            <p className="text-[11px] text-coco-muted font-medium">{t("profile.earned")}</p>
          </Card>
        </div>

        <Card className="mt-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-coco-muted">{t("profile.phone")}</span><span className="font-medium text-coco-ink">{user.phone}</span></div>
            <div className="flex justify-between"><span className="text-coco-muted">{t("profile.email")}</span><span className="font-medium text-coco-ink">{user.email}</span></div>
          </div>
        </Card>

        <div className="mt-4 text-center">
          <InstallAppButton />
        </div>
      </div>
    </PageTransition>
  );
}
