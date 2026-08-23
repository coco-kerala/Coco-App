"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANG_META } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, openPicker, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={openPicker}
      className="inline-flex items-center gap-1 rounded-full bg-coco-leaf-soft px-2.5 py-1 text-[11px] font-bold text-coco-green"
      title={t("language.change")}
    >
      <Languages size={12} />
      {LANG_META[lang]?.native?.slice(0, 6) || "EN"}
    </button>
  );
}
