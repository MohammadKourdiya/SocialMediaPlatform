import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// ملفات الترجمة
import arTranslation from "./ar.json";
import trTranslation from "./tr.json";

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: arTranslation,
    },
    tr: {
      translation: trTranslation,
    },
  },
  lng: "ar", // اللغة الافتراضية
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
