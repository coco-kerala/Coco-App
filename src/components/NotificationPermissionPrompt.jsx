"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useNotifications } from "@/hooks/useNotifications";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const SESSION_KEY = "kerago_notif_session_dismiss";

/**
 * Ask for alerts only after the app is installed (home screen / standalone).
 */
export function NotificationPermissionPrompt({ delayMs = 900 }) {
  const { t } = useT();
  const { installed } = useInstallPrompt();
  const { permission, requestPermission } = useNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!installed) {
      setOpen(false);
      return;
    }
    if (typeof Notification === "undefined") return;
    if (permission === "granted") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {}
    const timer = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(timer);
  }, [installed, permission, delayMs]);

  if (!installed || !open || permission === "granted") return null;

  const softClose = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setOpen(false);
  };

  return (
    <Modal open onClose={softClose} title={t("notif.promptTitle")}>
      <div className="flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-full bg-coco-leaf-soft text-coco-leaf flex items-center justify-center mb-3">
          <Bell size={28} />
        </div>
        <p className="text-sm text-coco-muted leading-relaxed">{t("notif.promptBody")}</p>
        {permission === "denied" && (
          <p className="mt-3 text-xs font-semibold text-coco-shell leading-relaxed">
            {t("notif.deniedHint") || "Alerts are blocked. Open phone Settings → site → allow notifications, then refresh."}
          </p>
        )}
      </div>
      <div className="mt-5 flex flex-col gap-2">
        {permission !== "denied" && (
          <Button
            fullWidth
            onClick={async () => {
              const result = await requestPermission();
              if (result === "granted") setOpen(false);
              else softClose();
            }}
          >
            {t("notif.allow")}
          </Button>
        )}
        <Button fullWidth variant="ghost" onClick={softClose}>
          {t("notif.later")}
        </Button>
      </div>
    </Modal>
  );
}
