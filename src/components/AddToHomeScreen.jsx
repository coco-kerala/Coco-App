"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

/** One-click install on Android (Chrome). iOS requires manual Share → Add to Home Screen — Apple has no API for this. */
export function InstallAppButton() {
  const { t } = useT();
  const { canNativeInstall, ios, installed, promptInstall } = useInstallPrompt();
  const [iosHelp, setIosHelp] = useState(false);
  const [loading, setLoading] = useState(false);

  if (installed) return null;

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

    if (ios) {
      setIosHelp(true);
      return;
    }
  };

  // Hide on desktop browsers that can't install (no native prompt, not iOS)
  if (!canNativeInstall && !ios) return null;

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

      {iosHelp && (
        <Modal open onClose={() => setIosHelp(false)} title={t("install.iosTitle")}>
          <p className="text-sm text-coco-muted mb-4">{t("install.iosHint")}</p>
          <ol className="space-y-2">
            {[t("install.ios1"), t("install.ios2"), t("install.ios3")].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-coco-ink">
                <span className="font-bold text-coco-green shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          <Button fullWidth className="mt-5" onClick={() => setIosHelp(false)}>{t("install.gotIt")}</Button>
        </Modal>
      )}
    </>
  );
}
