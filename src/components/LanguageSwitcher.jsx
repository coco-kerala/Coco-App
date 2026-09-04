"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANG_META } from "@/lib/i18n";

/** Always visible top-right control to change language */
export function LanguageSwitcher() {
  const { lang, openPicker, t } = useLanguage();
  const meta = LANG_META[lang];

  return (
    <button
      type="button"
      onClick={openPicker}
      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-coco-border shadow-sm px-3 py-1.5 text-xs font-bold text-coco-ink active:scale-95"
      title={t("language.change")}
      aria-label={t("language.change")}
    >
      <Languages size={14} className="text-coco-green" />
      <span>{meta?.native || "EN"}</span>
    </button>
  );
}
