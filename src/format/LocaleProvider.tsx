/**
 * The app's locale, for every component that formats dates, times and
 * numbers (FormatNumber, DatePicker, EventCalendar, Progress, Slider, the
 * charts…), unless one is given its own `locale`.
 *
 *   <LocaleProvider locale="fr-FR"><App /></LocaleProvider>
 *
 * - `locale`: a BCP 47 tag ('en-GB', 'fr-FR'); without a provider, the browser's
 *
 * `useLocale()` gives it (undefined without a provider), e.g. for your own
 * Intl formatters. It's also given to Ark's LocaleProvider, so Ark's parts
 * built by hand follow it too.
 */
import { createContext, useContext, type ReactNode } from 'react'
import { LocaleProvider as ArkLocaleProvider } from '@ark-ui/react/locale'

const LocaleContext = createContext<string | undefined>(undefined)

export function LocaleProvider({ locale, children }: { locale: string, children?: ReactNode }) {
  return (
    <LocaleContext value={locale}>
      <ArkLocaleProvider locale={locale}>{children}</ArkLocaleProvider>
    </LocaleContext>
  )
}

export const useLocale = () => useContext(LocaleContext)
