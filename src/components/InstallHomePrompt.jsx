"use client";

import { useEffect, useState } from "react";
import { Smartphone, Share } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

const STORAGE_KEY = "kerago_install_prompt_seen";

function isPhone() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
}

/**
 * After login on a phone: ask once to add KeraGo to the home screen.
 * Android Chrome → native install. iPhone → simple Share steps.
 */
export function InstallHomePrompt({ delayMs = 800 }) {
  const { t } = useT();
  const { canNativeInstall, ios, installed, promptInstall } = useInstallPrompt();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (installed || !isPhone()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {}
    const timer = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(timer);
  }, [installed, delayMs]);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
    setShowIosSteps(false);
  };

  const onInstall = async () => {
    if (canNativeInstall) {
      setLoading(true);
      try {
        await promptInstall();
      } finally {
        setLoading(false);
      }
      dismiss();
      return;
    }
    if (ios) {
      setShowIosSteps(true);
      return;
    }
    // Other mobile browsers: show generic Android-style steps
    setShowIosSteps(true);
  };

  if (!open || installed) return null;

  return (
    <Modal open onClose={dismiss} title={t("install.title")}>
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" className="mb-3" />
        <p className="text-sm text-coco-muted leading-relaxed">{t("install.subtitle")}</p>
        <p className="mt-2 text-xs text-coco-muted">{t("install.phoneOnly")}</p>
      </div>

      {showIosSteps ? (
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
          <Button fullWidth className="mt-5" onClick={dismiss}>{t("install.gotIt")}</Button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          <Button fullWidth loading={loading} onClick={onInstall} className="gap-2">
            <Smartphone size={18} />
            {canNativeInstall ? t("install.installNow") : t("install.addToHome")}
          </Button>
          <Button fullWidth variant="ghost" onClick={dismiss}>
            {t("install.later")}
          </Button>
        </div>
      )}
    </Modal>
  );
}
