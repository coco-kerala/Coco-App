"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useT } from "@/contexts/LanguageContext";
import { getPropertiesByCustomer } from "@/lib/data/store";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPin, Trees } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

export default function TreesPage() {
  const { user } = useAuth();
  const { version } = useAppData();
  const { t } = useT();
  const properties = useMemo(() => getPropertiesByCustomer(user.id), [user.id, version]);

  const totalTrees = properties.reduce((sum, p) => sum + (p.tree_count || 0), 0);

  return (
    <PageTransition>
      <div className="px-5 pt-6">
        <h1 className="text-2xl font-extrabold text-coco-ink">{t("profile.myTrees")}</h1>

        <Card className="mt-5 bg-gradient-to-br from-coco-green to-coco-green-light text-white border-0">
          <p className="text-white/70 text-sm">{t("profile.totalAcross")}</p>
          <p className="text-4xl font-extrabold mt-1">{totalTrees} <span className="text-lg font-medium text-white/80">{t("profile.treesWord")}</span></p>
        </Card>

        <div className="mt-6 space-y-3">
          {properties.length === 0 ? (
            <Card padding="none"><EmptyState compact title={t("profile.noProperties")} description={t("profile.noPropertiesDesc")} /></Card>
          ) : (
            properties.map((p) => (
              <Card key={p.id}>
                <h3 className="font-bold text-coco-ink">{p.name}</h3>
                <p className="mt-1 text-sm text-coco-muted flex items-center gap-1"><MapPin size={13} />{p.address}, {p.city}</p>
                <p className="mt-1 text-sm text-coco-muted flex items-center gap-1"><Trees size={13} />{p.tree_count} {t("customer.trees")}</p>
                {p.last_service_date && <p className="mt-2 text-xs text-coco-green font-medium">{t("profile.lastServiced")}: {p.last_service_date}</p>}
              </Card>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
