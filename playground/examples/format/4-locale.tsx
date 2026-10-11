/* One locale for the app
  `LocaleProvider` sets the locale for everything inside: formatting, DatePicker, Progress, the charts, EventCalendar… (each can still take its own `locale`). Switch it here. */
import { useState } from 'react'
import { LocaleProvider, FormatNumber, FormatRelative, FormatBytes, DatePicker, Progress, Segmented, Stat } from '@milktop/react-ui'

const locales = [{ value: 'en-GB', label: 'English (UK)' }, { value: 'en-US', label: 'English (US)' }, { value: 'fr-FR', label: 'Français' }, { value: 'de-DE', label: 'Deutsch' }]

export default function Example() {
  const [locale, setLocale] = useState('fr-FR')
  return (
    <div className="flex w-full flex-col gap-5">
      <Segmented size="sm" items={locales} value={locale} onValueChange={(v) => v && setLocale(v)} />
      <LocaleProvider locale={locale}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1 text-sm">
            <span><FormatNumber value={1820.5} style="currency" currency="EUR" /></span>
            <span><FormatNumber value={1234567.891} /></span>
            <span><FormatBytes value={2516582} /></span>
            <span><FormatRelative value={new Date(Date.now() - 3 * 3600000)} /></span>
          </div>
          <Stat label="Revenue" value={18200} format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }} change={12.5} />
          <DatePicker label="Date" defaultValue="2026-10-11" />
          <Progress value={64} label="Progress" showValue />
        </div>
      </LocaleProvider>
    </div>
  )
}
