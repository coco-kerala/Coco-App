import en from "./en";
import ml from "./ml";
import hi from "./hi";
import ta from "./ta";
import kn from "./kn";
import bn from "./bn";

export const translations = { en, ml, hi, ta, kn, bn };

export const LANG_META = {
  en: { label: "English", native: "English" },
  ml: { label: "Malayalam", native: "മലയാളം" },
  hi: { label: "Hindi", native: "हिन्दी" },
  ta: { label: "Tamil", native: "தமிழ்" },
  kn: { label: "Kannada", native: "ಕನ್ನಡ" },
  bn: { label: "Bengali", native: "বাংলা" },
};

/** Home app (bookers) vs Partner app (field pros) — Urban Company style */
export const ROLE_LANGUAGES = {
  customer: ["en", "ml", "hi"],
  worker: ["en", "ml", "ta", "kn", "hi"],
  admin: ["en"],
};

export function resolve(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj) ?? path;
}

export function getTranslation(lang, path) {
  const dict = translations[lang] || translations.en;
  const val = resolve(dict, path);
  if (val !== path) return val;
  return resolve(translations.en, path);
}
