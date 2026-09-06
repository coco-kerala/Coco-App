"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/hooks/useAppData";
import { useT } from "@/contexts/LanguageContext";
import { getRequestsByCustomer } from "@/lib/data/store";
import { RequestCard } from "@/components/customer/RequestCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { PageTransition } from "@/components/PageTransition";

export default function RequestsListPage() {
  const { user } = useAuth();
  const { version } = useAppData();
  const { t } = useT();
  const requests = useMemo(() => getRequestsByCustomer(user.id), [user.id, version]);

  return (
    <PageTransition>
      <div className="px-5 pt-6">
        <h1 className="text-2xl font-extrabold text-coco-ink">{t("profile.myRequests")}</h1>
        <div className="mt-5 space-y-3">
          {requests.length === 0 ? (
            <Card padding="none">
              <EmptyState
                title={t("profile.noRequests")}
                description={t("profile.noRequestsDesc")}
                actionLabel={t("customer.requestService")}
                actionHref="/user?modal=request"
              />
            </Card>
          ) : (
            requests.map((r) => <RequestCard key={r.id} request={r} href={`/user/requests/${r.id}`} />)
          )}
        </div>
      </div>
    </PageTransition>
  );
}
