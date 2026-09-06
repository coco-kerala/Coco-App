"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

function isPhone() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/** One-click install on Android (Chrome). iOS / others get step-by-step help. */
export function InstallAppButton() {
  const { t } = useT();
  const { canNativeInstall, ios, installed, promptInstall } = useInstallPrompt();
  const [help, setHelp] = useState(false);
  const [loading, setLoading] = useState(false);

  if (installed) return null;
  if (!canNativeInstall && !ios && !isPhone()) return null;

  const handleClick = async () => {
    if (canNativeInstall) {
      setLoading(true);
      try {
        await promptInstall();
      } finally {
        setLoading(false);
      }
      return;
    }
    setHelp(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="soft"
        fullWidth
        loading={loading}
        onClick={handleClick}
        className="gap-2"
      >
        <Smartphone size={16} />
        {canNativeInstall ? t("install.installNow") : t("install.addToHome")}
      </Button>

      {help && (
        <Modal open onClose={() => setHelp(false)} title={ios ? t("install.iosTitle") : t("install.androidTitle")}>
          <p className="text-sm text-coco-muted mb-4">{ios ? t("install.iosHint") : t("install.subtitle")}</p>
          <ol className="space-y-2">
            {(ios
              ? [t("install.ios1"), t("install.ios2"), t("install.ios3")]
              : [t("install.android1"), t("install.android2"), t("install.android3")]
            ).map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-coco-ink">
                <span className="font-bold text-coco-leaf shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          <Button fullWidth className="mt-5" onClick={() => setHelp(false)}>{t("install.gotIt")}</Button>
        </Modal>
      )}
    </>
  );
}
