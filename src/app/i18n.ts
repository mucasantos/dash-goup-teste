import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from "./locales/en.json";
import esTranslations from "./locales/es.json";
import ptPTTranslations from "./locales/pt-PT.json";
import frTranslations from "./locales/fr.json";

const DEFAULT_LANGUAGE = "pt-PT";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      "pt-PT": { translation: ptPTTranslations },
      fr: { translation: frTranslations },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator"],
      caches: ["cookie"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

if (
  !i18n.language ||
  !Object.keys(i18n.services.resourceStore.data).includes(i18n.language)
) {
  i18n.changeLanguage(DEFAULT_LANGUAGE);
}

export default i18n;
