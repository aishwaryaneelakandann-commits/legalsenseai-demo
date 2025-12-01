import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.json";
import ta from "./translations/ta.json";
import te from "./translations/te.json";
import kn from "./translations/kn.json";
import hi from "./translations/hi.json";

export const LANGUAGE_OPTIONS = [
  { label: "english", code: "en" },
  { label: "tamil", code: "ta" },
  { label: "telugu", code: "te" },
  { label: "kannada", code: "kn" },
  { label: "hindi", code: "hi" },
];

const resources = {
  en: { translation: en },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
  hi: { translation: hi },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
