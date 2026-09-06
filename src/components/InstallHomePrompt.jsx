"use client";

import { useEffect, useState } from "react";
import { Smartphone, Share } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

const SESSION_KEY = "kerago_install_session_dismiss";

function isPhone() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
}

/**
 * Ask to add KeraGo to the home screen.
 * Keeps showing on each visit until the app is actually installed.
 * "Later" only hides for this browser session.
 */
export function InstallHomePrompt({ delayMs = 600, forcePhoneOnly = true }) {
  const { t } = useT();
  const { canNativeInstall, ios, installed, promptInstall } = useInstallPrompt();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (installed) return;
    if (forcePhoneOnly && !isPhone()) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {}
    const timer = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(timer);
  }, [installed, delayMs, forcePhoneOnly]);

  const softClose = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setOpen(false);
    setShowSteps(false);
  };

  const onInstall = async () => {
    // iPhone never gets a one-tap install — always show Safari Share steps.
    if (ios) {
      setShowSteps(true);
      return;
    }
    if (canNativeInstall) {
      setLoading(true);
      try {
        const res = await promptInstall();
        if (res?.outcome === "accepted") {
          setOpen(false);
          return;
        }
        // User dismissed system dialog — show manual Chrome steps as backup.
        setShowSteps(true);
      } finally {
        setLoading(false);
      }
      return;
    }
    setShowSteps(true);
  };

  if (!open || installed) return null;

  return (
    <Modal open onClose={softClose} title={t("install.title")}>
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" className="mb-3" />
        <p className="text-sm text-coco-muted leading-relaxed">{t("install.subtitle")}</p>
        <p className="mt-2 text-xs font-semibold text-coco-shell">
          {t("install.keepShowing") || "We will ask again until you add KeraGo to your home screen."}
        </p>
      </div>

      {showSteps ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-coco-ink mb-3">
            {ios ? t("install.iosTitle") : t("install.androidTitle")}
          </p>
          <ol className="space-y-2.5 text-left">
            {(ios
              ? [t("install.ios1"), t("install.ios2"), t("install.ios3")]
              : [t("install.android1"), t("install.android2"), t("install.android3")]
            ).map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-coco-ink">
                <span className="font-bold text-coco-leaf shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {ios && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-coco-muted">
              <Share size={14} /> {t("install.lookForShare")}
            </p>
          )}
          <Button fullWidth className="mt-5" onClick={softClose}>{t("install.gotIt")}</Button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          <Button fullWidth loading={loading} onClick={onInstall} className="gap-2">
            <Smartphone size={18} />
            {canNativeInstall ? t("install.installNow") : t("install.addToHome")}
          </Button>
          <Button fullWidth variant="ghost" onClick={softClose}>
            {t("install.later")}
          </Button>
        </div>
      )}
    </Modal>
  );
}
