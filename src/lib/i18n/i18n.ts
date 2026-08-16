import i18next from "i18next";
import en from "./locales/en.json"
import id from "./locales/id.json"
import { initReactI18next } from "react-i18next";

void i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id }
    },
    lng: "id",
    fallbackLng: "id",
    interpolation: {
      escapeValue: false,
    },
  })

export default i18next
