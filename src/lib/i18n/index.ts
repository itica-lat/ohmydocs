import { useSettingsStore } from "@/features/settings/store"
import { translations, type TranslationKey } from "./translations"

export function useT(): (key: TranslationKey) => string {
  const locale = useSettingsStore((s) => s.locale)
  return (key) => translations[locale][key] ?? translations["en"][key] ?? key
}

export type { Locale, TranslationKey } from "./translations"
