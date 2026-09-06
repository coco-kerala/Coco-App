"use client";

import { Headphones, Phone, MessageCircle, Mail, Clock } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/Card";

/**
 * Support hub — contact details filled later by owner.
 * Layout matches Urban Company / Snabbit help screens.
 */
export function SupportPage() {
  const { t } = useT();

  const rows = [
    { icon: Phone, label: t("support.phone"), value: t("support.phoneSoon") },
    { icon: MessageCircle, label: t("support.whatsapp"), value: t("support.whatsappSoon") },
    { icon: Mail, label: t("support.email"), value: t("support.emailSoon") },
    { icon: Clock, label: t("support.hours"), value: t("support.hoursValue") },
  ];

  return (
    <PageTransition>
      <div className="px-5 pt-4 pb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-coco-leaf-soft text-coco-leaf flex items-center justify-center">
            <Headphones size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-coco-ink">{t("support.title")}</h1>
            <p className="text-sm text-coco-muted">{t("support.subtitle")}</p>
          </div>
        </div>

        <Card className="mt-6 divide-y divide-coco-border p-0 overflow-hidden">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-start gap-3 px-4 py-4">
                <div className="h-10 w-10 rounded-full bg-coco-cream text-coco-leaf flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-coco-muted">{row.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-coco-ink">{row.value}</p>
                </div>
              </div>
            );
          })}
        </Card>

        <p className="mt-5 text-sm text-coco-muted leading-relaxed text-center">
          {t("support.footer")}
        </p>
      </div>
    </PageTransition>
  );
}
