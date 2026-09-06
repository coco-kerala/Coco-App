"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

/**
 * Once after install prompt: ask phone users to allow notifications.
 */
export function NotificationPermissionPrompt({ delayMs = 3500 }) {
  const { t } = useT();
  const { permission, requestPermission } = useNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (permission === "granted" || permission === "denied") return;
    try {
      if (localStorage.getItem("kerago_notif_asked") === "1") return;
    } catch {}
    const isPhone = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (!isPhone) return;
    const timer = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(timer);
  }, [permission, delayMs]);

  if (!open) return null;

  return (
    <Modal open onClose={() => setOpen(false)} title={t("notif.promptTitle")}>
      <div className="flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-full bg-coco-leaf-soft text-coco-leaf flex items-center justify-center mb-3">
          <Bell size={28} />
        </div>
        <p className="text-sm text-coco-muted leading-relaxed">{t("notif.promptBody")}</p>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <Button
          fullWidth
          onClick={async () => {
            await requestPermission();
            setOpen(false);
          }}
        >
          {t("notif.allow")}
        </Button>
        <Button
          fullWidth
          variant="ghost"
          onClick={() => {
            try {
              localStorage.setItem("kerago_notif_asked", "1");
            } catch {}
            setOpen(false);
          }}
        >
          {t("notif.later")}
        </Button>
      </div>
    </Modal>
  );
}
