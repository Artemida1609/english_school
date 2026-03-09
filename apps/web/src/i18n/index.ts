import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import uk from "./locales/uk.json";
import en from "./locales/en.json";

export const LANGUAGES = [
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "en", label: "English",    flag: "🇬🇧" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    resources: {
      uk: { translation: uk },
      en: { translation: en },
    },
    fallbackLng: "uk",
    supportedLngs: ["uk", "en"],
    detection: {
      // зберігати вибір у localStorage під ключем "language-storage"
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language-storage",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React сам екранує
    },
  });

export default i18n;