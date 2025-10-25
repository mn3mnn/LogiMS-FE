import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./lang/en/en.json";
import de from "./lang/de/de.json";
import ar from "./lang/ar/ar.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      // check localStorage first, then htmlTag and browser settings
      order: ["localStorage", "htmlTag", "navigator"],
      caches: ["localStorage"],
    },
  });

// OPTIONAL: expose for debugging (remove in production)
if (typeof window !== "undefined") {
  // @ts-ignore
  window.i18next = i18n;
}

export default i18n;
