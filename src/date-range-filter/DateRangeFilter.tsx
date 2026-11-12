/**
 * A date range filter: a button that opens preset ranges beside a range
 * calendar, for narrowing a list to some dates.
 *
 *   <DateRangeFilter value={dates} onValueChange={setDates} />
 *   <DateRangeFilter presets={['today', 'next7', 'nextMonth']} value={dates} onValueChange={setDates} />
 *
 * - `value`, `defaultValue`: [from, to] as ISO dates ('YYYY-MM-DD'), empty for all dates
 * - `onValueChange`: called with [from, to] once both ends are picked, or [] when cleared
 * - `presets`: keys of the built-in ranges, or `{ label, range }` for one of
 *   your own (below), mixed in any order
 * - `placeholder`: the button's text with no dates ("All dates")
 * - `placement`: where the panel opens ('bottom-end')
 * - `size`: the button's, to sit beside other controls ('sm', 'md' or 'lg')
 * - `locale`: for the dates on the button and the calendar (the
 *   LocaleProvider's, or 'en-GB')
 *
 * A preset fills in the calendar, and dates picked there light up the preset
 * they match. The panel stays open until Escape or a click outside.
 *
 * A preset of your own is a `label` for its button (and the trigger, once
 * picked) and a `range` function returning [from, to] as local Dates or ISO
 * strings, both days included. It runs each time it's used, so it can't go
 * stale, and it's given the locale's first day of the week (1 Monday to 7
 * Sunday) for ranges that care. Its label is yours to translate.
 *
 * Built-in ranges: today, yesterday, tomorrow, last7, last30, next7, next30,
 * thisWeek, lastWeek, nextWeek, thisMonth, lastMonth, nextMonth, thisQuarter,
 * lastQuarter, thisYear, lastYear; their labels are the messages'
 * `dateRangeFilter.ranges`.
 */
import { useState } from 'react'
import { Button, type ButtonProps } from '../button/Button.js'
import { DatePicker } from '../date-picker/DatePicker.js'
import { Popover, type PopoverProps } from '../popover/Popover.js'
import { useLocale, useMessages } from '../format/LocaleProvider.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import '../theme.css'
import './date-range-filter.css'

export type DateRangeKey = keyof typeof dateRanges
export type DateRangePreset = { label: string, range: (firstDay: number) => (Date | string)[] }

export type DateRangeFilterProps = {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  presets?: (DateRangeKey | DateRangePreset)[]
  placeholder?: string | null
  placement?: PopoverProps['placement']
  size?: ButtonProps['size']
  locale?: string | null
  className?: string
  classes?: Classes<'trigger' | 'panel' | 'presets' | 'preset' | 'clear' | 'calendar'>
}

const day = (y: number, m: number, d: number) => new Date(y, m, d)

// Days from today, e.g. days(-6, 0) for the last 7.
function days(from: number, to: number) {
  const now = new Date()
  return [day(now.getFullYear(), now.getMonth(), now.getDate() + from), day(now.getFullYear(), now.getMonth(), now.getDate() + to)]
}

function week(offset: number, firstDay: number) {
  const now = new Date()
  const start = now.getDate() - ((now.getDay() - (firstDay % 7) + 7) % 7) + offset * 7
  return [day(now.getFullYear(), now.getMonth(), start), day(now.getFullYear(), now.getMonth(), start + 6)]
}

// Whole months from a month index in this year; Date rolls over past 0–11.
function months(start: number, length: number) {
  const year = new Date().getFullYear()
  return [day(year, start, 1), day(year, start + length, 0)]
}

const month = () => new Date().getMonth()
const quarter = () => Math.floor(month() / 3) * 3

export const dateRanges = {
  today: () => days(0, 0),
  yesterday: () => days(-1, -1),
  tomorrow: () => days(1, 1),
  last7: () => days(-6, 0),
  last30: () => days(-29, 0),
  next7: () => days(0, 6),
  next30: () => days(0, 29),
  thisWeek: (firstDay: number) => week(0, firstDay),
  lastWeek: (firstDay: number) => week(-1, firstDay),
  nextWeek: (firstDay: number) => week(1, firstDay),
  thisMonth: () => months(month(), 1),
  lastMonth: () => months(month() - 1, 1),
  nextMonth: () => months(month() + 1, 1),
  thisQuarter: () => months(quarter(), 3),
  lastQuarter: () => months(quarter() - 3, 3),
  thisYear: () => months(0, 12),
  lastYear: () => months(-12, 12),
}

// Local 'YYYY-MM-DD'; toISOString would shift it to UTC.
const pad = (n: number) => String(n).padStart(2, '0')
const iso = (date: Date | string) => typeof date === 'string' ? date : `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

function fromIso(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// 1 Monday to 7 Sunday; Monday where the browser can't say.
function firstDayOf(locale: string) {
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }, weekInfo?: { firstDay: number } }
    return (info.getWeekInfo ? info.getWeekInfo() : info.weekInfo)?.firstDay ?? 1
  } catch {
    return 1
  }
}

function DateRangeFilterShortcut({
  value, defaultValue, onValueChange, presets = ['today', 'last7', 'last30', 'thisMonth', 'lastMonth', 'thisQuarter', 'lastQuarter', 'thisYear', 'lastYear'],
  placeholder = null, placement = 'bottom-end', size = 'md', locale: localeProp = null, className, classes,
}: DateRangeFilterProps) {
  const t = useMessages()
  const app = useLocale()
  const locale = localeProp ?? app ?? 'en-GB'
  const part = partsOf('date-range-filter', classes)
  const [dates, setDates] = useControllable<string[]>(value, defaultValue ?? [], undefined)
  // The calendar's own range while it's being picked: one end, until the other
  const [picking, setPicking] = useState<string[]>(dates)
  // Bumped to start the calendar afresh on the range's first month (Zag keeps
  // the month shown when its value changes from outside, as a preset does)
  const [shown, setShown] = useState(0)

  const firstDay = firstDayOf(locale)
  const items = presets.map((preset) => typeof preset === 'string'
    ? { label: t.dateRangeFilter.ranges[preset], range: dateRanges[preset] } : preset)
  const datesOf = (item: DateRangePreset) => item.range(firstDay).map(iso)
  const [from, to] = dates
  const matches = (item: DateRangePreset) => !!to && String(datesOf(item)) === String([from, to])
  const active = items.find(matches)

  const format = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  const label = !from ? placeholder ?? t.dateRangeFilter.placeholder
    : active ? active.label
    : !to || from === to ? format.format(fromIso(from))
    : format.formatRange(fromIso(from), fromIso(to))

  function change(next: string[]) {
    setPicking(next)
    setShown((n) => n + 1)
    setDates(next)
    onValueChange?.(next)
  }

  function picked(next: string[]) {
    setPicking(next)
    if (next.length !== 2) return
    setDates(next)
    onValueChange?.(next)
  }

  return (
    <Popover placement={placement} data-date-range-filter=""
      onOpenChange={(open) => { if (open) { setPicking(dates); setShown((n) => n + 1) } }}
      trigger={
        <Button size={size} icon="lucide:calendar" iconEnd="lucide:chevron-down" className={cx(className, classes?.trigger)}>
          {label}
        </Button>
      }>
      <div {...part('panel')}>
        <div {...part('presets')}>
          {items.map((item, i) => (
            <Button key={i} block size="sm" variant="ghost" className={classes?.preset} aria-pressed={matches(item)} onClick={() => change(datesOf(item))}>
              {item.label}
            </Button>
          ))}
          <Button block size="sm" icon="lucide:x" className={classes?.clear} data-clear="" disabled={!dates.length} onClick={() => change([])}>
            {t.dateRangeFilter.clear}
          </Button>
        </div>
        <DatePicker key={shown} inline range locale={locale} value={picking} onValueChange={picked} className={classes?.calendar} />
      </div>
    </Popover>
  )
}

export const DateRangeFilter = DateRangeFilterShortcut

/*
  A preset of your own, beside built-in ones: the school year so far, from 1 September.

    const schoolYear = {
      label: 'School year',
      range: () => {
        const now = new Date()
        const year = now.getMonth() < 8 ? now.getFullYear() - 1 : now.getFullYear()
        return [new Date(year, 8, 1), now]
      },
    }

    <DateRangeFilter presets={['thisMonth', 'lastMonth', schoolYear]} value={dates} onValueChange={setDates} />
*/
