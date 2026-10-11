/**
 * A number whose digits roll to their new value when it changes, e.g. a live
 * count on a dashboard. Formatted like FormatNumber; still while the system
 * asks for reduced motion.
 *
 *   <RollingNumber value={appointments.length} />
 *   <RollingNumber value={revenue} format={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }} />
 *
 * - `value`: the number
 * - `format`: Intl.NumberFormat's options (grouping by default)
 * - `duration`: how long a roll takes, in ms (600)
 * - `locale`: the LocaleProvider's (or the browser's) by default
 *
 * Assistive tech reads the whole number, not the digits.
 */
import type { CSSProperties, HTMLAttributes } from 'react'
import { formatNumber } from '../format/format.js'
import { useLocale } from '../format/LocaleProvider.js'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './rolling-number.css'

export type RollingNumberProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  value: number
  format?: Intl.NumberFormatOptions
  duration?: number
  locale?: string
  classes?: Classes<'root' | 'digit' | 'strip' | 'char'>
}

const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

export function RollingNumber({ value, format = {}, duration = 600, locale, className, classes, style, ...rest }: RollingNumberProps) {
  const app = useLocale()
  const part = partsOf('rolling-number', classes)
  const text = formatNumber(value, { ...format, locale: locale ?? app })
  // Keyed from the right, so the ones stay the ones as the number grows.
  const chars = [...text].map((char, i, all) => ({ char, key: all.length - i }))

  return (
    <span {...rest} {...part('root')} className={cx(className, classes?.root)} role="img" aria-label={text}
      style={{ ...style, '--duration': `${duration}ms` } as CSSProperties}>
      {chars.map(({ char, key }) => /\d/.test(char)
        // A column of 0–9, moved so the digit shows.
        ? <span key={key} {...part('digit')} aria-hidden="true">
            <span {...part('strip')} style={{ '--digit': Number(char) } as CSSProperties}>
              {digits.map((d) => <span key={d}>{d}</span>)}
            </span>
            <span {...part('sizer')}>0</span>
          </span>
        : <span key={key} {...part('char')} aria-hidden="true">{char}</span>)}
    </span>
  )
}
