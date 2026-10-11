/**
 * The app's locale and words, for every component that formats dates, times
 * and numbers (FormatNumber, DatePicker, EventCalendar, Progress, Slider, the
 * charts…) or shows words of its own (placeholders, empty states, screen-reader
 * labels), unless one is given its own.
 *
 *   <LocaleProvider locale="fr-FR"><App /></LocaleProvider>
 *   <LocaleProvider locale="en-GB" messages={{ table: { empty: 'No patients yet' } }}>…
 *
 * - `locale`: a BCP 47 tag ('en-GB', 'fr-FR'); without a provider, the browser's
 * - `messages`: words to change, merged over the built-in list for the locale
 *   (English and French are built in; for another language give them all,
 *   starting from `en`). See `Messages` for the keys.
 *
 * `useLocale()` gives the locale (undefined without a provider), e.g. for your
 * own Intl formatters; `useMessages()` the words (English without one). The
 * locale is also given to Ark's LocaleProvider, so Ark's parts built by hand
 * follow it too.
 */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { LocaleProvider as ArkLocaleProvider } from '@ark-ui/react/locale'
import { builtIn, en, mergeMessages, type DeepPartial, type Messages } from './messages.js'

const LocaleContext = createContext<string | undefined>(undefined)
const MessagesContext = createContext<Messages>(en)

export type LocaleProviderProps = { locale: string, messages?: DeepPartial<Messages>, children?: ReactNode }

export function LocaleProvider({ locale, messages, children }: LocaleProviderProps) {
  const base = builtIn[locale.split('-')[0].toLowerCase()] ?? en
  // Keyed on the contents, so an inline `messages` object doesn't remake the words every render.
  const key = JSON.stringify(messages ?? null)
  const words = useMemo(() => mergeMessages(base, messages), [base, key]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const mine = { locale, messages: words }
    ambient = mine
    return () => { if (ambient === mine) ambient = { messages: en } }
  }, [locale, words])
  return (
    <LocaleContext value={locale}>
      <MessagesContext value={words}>
        <ArkLocaleProvider locale={locale}>{children}</ArkLocaleProvider>
      </MessagesContext>
    </LocaleContext>
  )
}

// The latest provider's locale and words, for what renders in a root of its
// own (confirm()), outside the app's tree.
let ambient: { locale?: string, messages: Messages } = { messages: en }

/** Gives its children the locale and words the app's LocaleProvider last had. */
export function AmbientLocale({ children }: { children?: ReactNode }) {
  const { locale, messages } = ambient
  return <LocaleContext value={locale}><MessagesContext value={messages}>{children}</MessagesContext></LocaleContext>
}

export const useLocale = () => useContext(LocaleContext)
export const useMessages = () => useContext(MessagesContext)
