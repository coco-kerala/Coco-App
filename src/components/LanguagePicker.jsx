"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { LANG_META } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export function LanguagePicker() {
  const { showPicker, allowed, lang, selectLanguage, t } = useLanguage();
  const [selected, setSelected] = useState(lang);

  useEffect(() => { setSelected(lang); }, [lang]);

  if (!showPicker) return null;

  return (
    <Modal open onClose={() => {}} title={t("language.choose")}>
      <p className="text-sm text-coco-muted mb-5">{t("language.chooseSub")}</p>
      <div className="space-y-2">
        {allowed.map((code) => {
          const meta = LANG_META[code];
          const active = selected === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setSelected(code)}
              className={cn(
                "w-full flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all",
                active ? "border-coco-green bg-coco-leaf-soft ring-2 ring-coco-green" : "border-coco-border bg-white hover:border-coco-green/40"
              )}
            >
              <div>
                <p className="font-bold text-coco-ink">{meta.native}</p>
                {meta.label !== meta.native && (
                  <p className="text-xs text-coco-muted mt-0.5">{meta.label}</p>
                )}
              </div>
              {active && (
                <div className="h-6 w-6 rounded-full bg-coco-green text-white flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => selectLanguage(selected)}
        className="mt-5 w-full h-[52px] rounded-2xl bg-coco-green text-white font-semibold text-base active:scale-[0.97] transition-transform"
      >
        {t("language.continue")}
      </button>
    </Modal>
  );
}
