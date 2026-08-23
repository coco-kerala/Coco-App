import en from "./en";
import ml from "./ml";
import hi from "./hi";
import bn from "./bn";

export const translations = { en, ml, hi, bn };

export const LANG_META = {
  en: { label: "English", native: "English" },
  ml: { label: "Malayalam", native: "മലയാളം" },
  hi: { label: "Hindi", native: "हिन्दी" },
  bn: { label: "Bengali", native: "বাংলা" },
};

export const ROLE_LANGUAGES = {
  customer: ["en", "ml"],
  worker: ["en", "ml", "hi", "bn"],
  admin: ["en"],
};

/** Resolve a dot-path key like "customer.headline1" from a translation object. */
export function resolve(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj) ?? path;
}

export function getTranslation(lang, path) {
  const dict = translations[lang] || translations.en;
  const val = resolve(dict, path);
  if (val !== path) return val;
  return resolve(translations.en, path);
}
