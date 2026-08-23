"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useGreeting } from "@/hooks/useGreeting";
import { useT } from "@/contexts/LanguageContext";
import { getActiveRequest, getRequestsByCustomer } from "@/lib/data/store";
import { formatDate, formatTime } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ServiceCard } from "@/components/customer/ServiceCard";
import { RequestCard } from "@/components/customer/RequestCard";
import { RequestServiceModal } from "@/components/customer/RequestServiceModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronRight } from "lucide-react";
import { Go } from "@/components/Go";

export function CustomerHomeClient({ showRequestModal }) {
  const { user } = useAuth();
  const { version, ready } = useAppData();
  const greeting = useGreeting();
  const { t } = useT();

  const active = useMemo(
    () => (ready ? getActiveRequest(user.id) : null),
    [user.id, version, ready]
  );
  const recent = useMemo(
    () => (ready ? getRequestsByCustomer(user.id).slice(0, 3) : []),
    [user.id, version, ready]
  );

  return (
    <>
      <div className="px-5 pt-8">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="h-10 w-10 rounded-full bg-coco-leaf-soft text-coco-green font-bold flex items-center justify-center text-sm">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-coco-muted font-medium">{greeting} 👋</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-coco-ink leading-tight">
            {t("customer.headline1")}<br />{t("customer.headline2")}
          </h1>
        </div>

        <div className="mt-7">
          <ServiceCard />
        </div>

        <Button fullWidth size="lg" className="mt-4" navTo="/customer" navParams={{ modal: "request" }}>
          {t("customer.requestServiceArrow")}
        </Button>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-coco-ink mb-3">{t("customer.activeRequest")}</h2>
          {active && !["confirmed", "cancelled"].includes(active.status) ? (
            <Go href={`/customer/requests/${active.id}`} className="block w-full">
              <Card hover>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span>🌴</span>
                      <h3 className="font-bold text-coco-ink">{t("customer.coconutPlucking")}</h3>
                    </div>
                    <p className="mt-2 text-sm text-coco-muted">{active.tree_count} {t("customer.trees")}</p>
                    {active.worker ? (
                      <p className="mt-3 text-sm font-semibold text-coco-ink">{active.worker.name}</p>
                    ) : (
                      <p className="mt-3 text-sm text-coco-muted">{t("customer.waitingWorker")}</p>
                    )}
                    <p className="mt-2 text-sm font-medium text-coco-ink">
                      {formatDate(active.preferred_date)} · {formatTime(active.preferred_time)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <StatusBadge status={active.status} />
                    <ChevronRight className="text-coco-muted" size={18} />
                  </div>
                </div>
              </Card>
            </Go>
          ) : (
            <Card padding="none">
              <EmptyState
                compact
                title={t("customer.noActiveRequests")}
                description={t("customer.noActiveDesc")}
                actionLabel={t("customer.requestService")}
                navTo="/customer"
                navParams={{ modal: "request" }}
              />
            </Card>
          )}
        </section>

        {recent.length > 0 && (
          <section className="mt-8 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-coco-ink">{t("customer.recent")}</h2>
              <Go href="/customer/requests" className="text-sm font-semibold text-coco-green">{t("customer.seeAll")}</Go>
            </div>
            <div className="space-y-3">
              {recent.map((r) => (
                <RequestCard key={r.id} request={r} href={`/customer/requests/${r.id}`} />
              ))}
            </div>
          </section>
        )}
      </div>

      <RequestServiceModal
        open={showRequestModal}
        onClose={() => { window.location.href = "/customer"; }}
      />
    </>
  );
}
