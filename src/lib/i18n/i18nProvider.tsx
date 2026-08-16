import type { PropsWithChildren } from "react"
import { useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import useLocalStorage from "@/hooks/useLocalStorage"
import i18next from "./i18n"

const I18nProvider = ({ children }: PropsWithChildren) => {
  const [language] = useLocalStorage("language", "id")

  useEffect(() => {
    void i18next.changeLanguage(language)
  }, [language])

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
}

export default I18nProvider
