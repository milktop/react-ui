/**
 * Formats a number for people (in a <data> element, which keeps the raw value):
 * currency, percent, units, compact.
 *
 *   <FormatNumber value={1820} style="currency" currency="GBP" />
 *   <FormatNumber value={0.125} style="percent" />
 *   <FormatNumber value={12400} notation="compact" />
 *
 * - `value`; and Intl.NumberFormat's options as props: `style` ('decimal',
 *   'currency', 'percent', 'unit'), `currency`, `unit`, `notation`,
 *   `minimumFractionDigits`, `maximumFractionDigits`, `signDisplay`…
 *   (`style` is Intl's, as in Ark's Format.Number: style it with `className`)
 * - `locale`: the LocaleProvider's (or the browser's) by default
 *
 * Also FormatBytes (`value` in bytes: '2.4 MB'; `binary` for MiB) and
 * FormatRelative (`value` a date: '2 hours ago', kept up to date; in a
 * <time>). As functions, for strings: formatNumber, formatBytes, formatRelative.
 */
import { useEffect, useState, type HTMLAttributes } from 'react'
import { formatBytes, formatNumber, formatRelative } from './format.js'
import { useLocale } from './LocaleProvider.js'
import { cx, partsOf } from '../utils.js'

type Base = Omit<HTMLAttributes<HTMLElement>, 'children' | 'style'> & { locale?: string, className?: string }

export type FormatNumberProps = Base & Omit<Intl.NumberFormatOptions, 'style'> & {
  value: number | bigint | null | undefined
  style?: Intl.NumberFormatOptions['style']
}

// Intl's options, taken out of the props (the rest go on the element).
const intlKeys = ['currency', 'currencyDisplay', 'currencySign', 'unit', 'unitDisplay', 'notation', 'compactDisplay', 'signDisplay',
  'useGrouping', 'minimumIntegerDigits', 'minimumFractionDigits', 'maximumFractionDigits', 'minimumSignificantDigits',
  'maximumSignificantDigits', 'roundingMode', 'roundingIncrement', 'trailingZeroDisplay', 'numberingSystem'] as const

export function FormatNumber({ value, locale, style, className, ...props }: FormatNumberProps) {
  const app = useLocale()
  const part = partsOf('format')
  const options: Intl.NumberFormatOptions = { ...(style && { style }) }
  const rest: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(props)) {
    if ((intlKeys as readonly string[]).includes(key)) (options as Record<string, unknown>)[key] = v
    else rest[key] = v
  }
  return <data {...rest} {...part('number')} className={cx(className)} value={value == null ? '' : String(value)}>
    {formatNumber(value, { ...options, locale: locale ?? app })}
  </data>
}

export type FormatBytesProps = Base & { value: number | null | undefined, binary?: boolean, maximumFractionDigits?: number }

export function FormatBytes({ value, locale, binary, maximumFractionDigits, className, ...rest }: FormatBytesProps) {
  const app = useLocale()
  const part = partsOf('format')
  return <data {...rest} {...part('bytes')} className={cx(className)} value={value == null ? '' : String(value)}>
    {formatBytes(value, { locale: locale ?? app, binary, maximumFractionDigits })}
  </data>
}

export type FormatRelativeProps = Base & {
  value: Date | string | number | null | undefined
  numeric?: 'auto' | 'always'
  live?: boolean
}

/** A time relative to now, kept up to date (`live`, default true: each 30 seconds). */
export function FormatRelative({ value, locale, numeric, live = true, className, ...rest }: FormatRelativeProps) {
  const app = useLocale()
  const part = partsOf('format')
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!live) return
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [live])
  const when = value == null ? null : value instanceof Date ? value : new Date(value)
  return (
    <time {...rest} {...part('relative')} className={cx(className)} dateTime={when && !Number.isNaN(when.getTime()) ? when.toISOString() : undefined}
      title={when ? when.toLocaleString(locale ?? app) : undefined}>
      {formatRelative(when, { locale: locale ?? app, now, numeric })}
    </time>
  )
}
