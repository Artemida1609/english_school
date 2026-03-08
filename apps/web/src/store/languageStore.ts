import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n, { type LangCode } from "../i18n";

interface LanguageStore {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "uk",
      setLanguage: (lang) => {
        set({ language: lang });
        i18n.changeLanguage(lang);
      },
    }),
    {
      name: "language-storage", // той самий ключ що в i18next detector
    }
  )
);