"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getTranslation, ROLE_LANGUAGES } from "@/lib/i18n";

const LanguageContext = createContext(null);

function storageKey(role, suffix) {
  return `coco_lang_${suffix}_${role}`;
}

export function LanguageProvider({ role, children }) {
  const allowed = ROLE_LANGUAGES[role] || ["en"];
  const [lang, setLang] = useState("en");
  const [ready, setReady] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    try {
      const picked = localStorage.getItem(storageKey(role, "picked"));
      const saved = localStorage.getItem(storageKey(role, "code"));
      if (saved && allowed.includes(saved)) setLang(saved);
      if (!picked) setShowPicker(true);
    } catch {}
    setReady(true);
  }, [role, allowed]);

  const selectLanguage = useCallback((code) => {
    if (!allowed.includes(code)) return;
    setLang(code);
    try {
      localStorage.setItem(storageKey(role, "code"), code);
      localStorage.setItem(storageKey(role, "picked"), "1");
    } catch {}
    setShowPicker(false);
  }, [role, allowed]);

  const openPicker = useCallback(() => setShowPicker(true), []);

  const t = useCallback((path) => getTranslation(lang, path), [lang]);

  const value = useMemo(
    () => ({ lang, role, allowed, ready, showPicker, selectLanguage, openPicker, t }),
    [lang, role, allowed, ready, showPicker, selectLanguage, openPicker, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Safe hook — returns English fallback when outside provider (e.g. admin). */
export function useT() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return { t: (path) => getTranslation("en", path), lang: "en", openPicker: () => {} };
  }
  return ctx;
}
