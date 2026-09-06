"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function NotificationsPage() {
  const { t } = useT();
  const { items, unread, markAllRead, permission, requestPermission } = useNotifications();

  return (
    <PageTransition>
      <div className="px-5 pt-4 pb-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-coco-ink">{t("notif.title")}</h1>
            <p className="text-sm text-coco-muted">
              {unread > 0 ? `${unread} ${t("notif.new")}` : t("notif.allCaught")}
            </p>
          </div>
          {unread > 0 && (
            <Button variant="soft" onClick={markAllRead}>{t("notif.markRead")}</Button>
          )}
        </div>

        {permission !== "granted" && typeof Notification !== "undefined" && (
          <Card className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-coco-ink">{t("notif.enableHint")}</p>
            <Button onClick={requestPermission}>{t("notif.allow")}</Button>
          </Card>
        )}

        <div className="mt-5 space-y-2">
          {items.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-coco-cream text-coco-muted flex items-center justify-center mb-3">
                <Bell size={26} />
              </div>
              <p className="font-semibold text-coco-ink">{t("notif.empty")}</p>
              <p className="mt-1 text-sm text-coco-muted max-w-[240px]">{t("notif.emptyDesc")}</p>
            </div>
          ) : (
            items.map((n) => {
              const inner = (
                <Card
                  className={`p-4 ${n.read ? "opacity-70" : "border-coco-leaf/40"}`}
                >
                  <p className="font-semibold text-coco-ink text-sm">{n.title}</p>
                  {n.body && <p className="mt-1 text-sm text-coco-muted">{n.body}</p>}
                  <p className="mt-2 text-[11px] text-coco-muted">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </Card>
              );
              return n.href ? (
                <Link key={n.id} href={n.href} className="block no-underline">{inner}</Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })
          )}
        </div>
      </div>
    </PageTransition>
  );
}
