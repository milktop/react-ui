/**
 * A date picker: type a date, or pick it from a calendar.
 *
 *   <DatePicker label="Lesson date" value={date} onValueChange={setDate} min="2026-01-01" />
 *
 * - `value`, `defaultValue`: an ISO date ('YYYY-MM-DD'), or an array of two with `range`
 * - `onValueChange`: called with the new value (the same shape)
 * - `range`: pick a start and an end
 * - `min`, `max`: ISO dates
 * - `unavailable`: function(CalendarDate) returning true for dates that can't
 *   be picked (weekends, holidays); they show struck through
 * - `locale`: for formatting and the first day of the week (the
 *   LocaleProvider's, or 'en-GB')
 * - `placement`: where the calendar opens ('bottom-start')
 * - `inline`: just the calendar, always showing (no input or popup), e.g. a
 *   month beside a schedule
 * - `prev`, `next`: elements to use as those buttons; they get the trigger's
 *   props, so a component must pass them on (as Button does)
 *
 * Up and Down in the input step its date by a day (Shift: a week), skipping
 * unavailable ones; on an empty input the first press picks today. Typing
 * puts in the locale's separators (11102026 → 11/10/2026; 11.10.2026 in
 * German); a separator typed by hand, or a pasted date, works too.
 *
 * A typed date is taken on Enter or when the input loses focus. One it can't
 * take (past `min` or `max`, `unavailable`, or not a whole date) stays in the
 * input, marked invalid with the reason under it, and the value doesn't
 * change; the input's validity is set too, so a form won't submit with it.
 * - `onInvalidChange`: called with the reason when that happens, and null
 *   once the input holds a date it takes (or is cleared)
 *
 * By hand, with Ark's parts: DatePicker.Root, Control, Input, Trigger,
 * Positioner, Content, View (one per view), ViewControl, PrevTrigger,
 * ViewTrigger, NextTrigger, Table, TableHead, TableHeader, TableBody,
 * TableRow, TableCell, TableCellTrigger, with DatePicker.Context for the
 * weeks, months and years to lay out.
 */
import { Fragment, useId, useMemo, useState, type FocusEvent, type FormEvent, type KeyboardEvent, type ReactElement, type ReactNode } from 'react'
import { DatePicker as Ark, parseDate, useDatePicker, type DatePickerValueChangeDetails, type DateValue } from '@ark-ui/react/date-picker'
import { useFieldContext } from '@ark-ui/react/field'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import { parseDateString } from '@zag-js/date-utils'
import 'iconify-icon'
import { useLocale, useMessages } from '../format/LocaleProvider.js'
import { cx, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './date-picker.css'

type One = { range?: false, value?: string | null, defaultValue?: string | null, onValueChange?: (value: string | null, details: DatePickerValueChangeDetails) => void }
type Range = { range: true, value?: string[], defaultValue?: string[], onValueChange?: (value: string[], details: DatePickerValueChangeDetails) => void }

export type DatePickerProps = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'min' | 'max' | 'label' | 'selectionMode'> & {
  label?: ReactNode
  min?: string | null
  max?: string | null
  unavailable?: ((date: DateValue) => boolean) | null
  placement?: NonNullable<Ark.RootProps['positioning']>['placement']
  prev?: ReactElement | null
  next?: ReactElement | null
  inline?: boolean
  onInvalidChange?: ((reason: string | null) => void) | null
  classes?: Classes<'root' | 'label' | 'control' | 'input' | 'separator' | 'clearTrigger' | 'trigger' | 'positioner' | 'content'
    | 'view' | 'viewControl' | 'prevTrigger' | 'viewTrigger' | 'nextTrigger' | 'table' | 'tableHeader' | 'tableCell' | 'tableCellTrigger' | 'error'>
} & (One | Range)

// Zag formats the input when the picker starts: a new locale (say, from the
// LocaleProvider) starts it afresh, so the dates show in the new format.
// The input's date pattern for a locale: its fields in order (with how many
// digits each takes) and the separator between them ('/', '.', '-').
function patternOf(locale: string) {
  const parts = new Intl.DateTimeFormat(locale).formatToParts(new Date(2000, 0, 1))
  const fields = parts.filter((p) => p.type === 'day' || p.type === 'month' || p.type === 'year').map((p) => (p.type === 'year' ? 4 : 2))
  const separator = parts.find((p) => p.type === 'literal')?.value.trim() || '/'
  return { fields, separator }
}

type Pattern = ReturnType<typeof patternOf>

// Typing at the end: once a field has its digits, add the separator after it;
// more digits than it takes (inserted in one go) carry on into the next field;
// a separator typed straight after one we added is dropped (no "11//").
// Runs before Zag's own handler, which then reads the new value.
function separate(e: FormEvent<HTMLInputElement>, { fields, separator }: Pattern) {
  const input = e.currentTarget
  const native = e.nativeEvent as InputEvent
  if (native.inputType !== 'insertText' || input.selectionStart !== input.value.length) return
  if (native.data === separator && input.value.endsWith(separator + separator)) {
    input.value = input.value.slice(0, -1)
    return
  }
  const pieces = input.value.split(separator)
  if (!pieces.every((piece) => /^\d*$/.test(piece))) return
  while (pieces.length < fields.length && pieces[pieces.length - 1].length > fields[pieces.length - 1]) {
    const last = pieces.pop()!
    pieces.push(last.slice(0, fields[pieces.length]), last.slice(fields[pieces.length]))
  }
  const index = pieces.length - 1
  if (index < fields.length - 1 && pieces[index].length === fields[index]) pieces.push('')
  const next = pieces.join(separator)
  if (next !== input.value) input.value = next
}

function DatePickerShortcut(props: DatePickerProps) {
  const app = useLocale()
  const locale = (props as { locale?: string }).locale ?? app ?? 'en-GB'
  return <DatePickerInner key={locale} {...props} locale={locale} />
}

function DatePickerInner(props: DatePickerProps) {
  const {
    label = null, value, defaultValue, onValueChange, range = false, min = null, max = null, unavailable = null,
    locale: localeProp, placement = 'bottom-start', prev = null, next = null, inline = false, onInvalidChange = null, className, classes, ...rest
  } = props as DatePickerProps & { value?: string | string[] | null, defaultValue?: string | string[] | null,
    onValueChange?: (value: string | string[] | null, details: DatePickerValueChangeDetails) => void }
  const field = useFieldContext()
  const t = useMessages()
  // Its own, the LocaleProvider's, or British (for day-month order and a Monday start).
  const locale = localeProp ?? 'en-GB'
  const pattern = useMemo(() => patternOf(locale), [locale])
  const part = partsOf('date-picker', classes)
  const [current, setCurrent] = useControllable<string | string[] | null>(value, defaultValue ?? (range ? [] : null), undefined)

  // CalendarDate#toString is ISO.
  function change(details: DatePickerValueChangeDetails) {
    report(null)
    const iso = details.value.map(String)
    const next = range ? iso : iso[0] ?? null
    setCurrent(next)
    onValueChange?.(next, details)
  }

  const picker = useDatePicker({
    locale, selectionMode: range ? 'range' : 'single',
    value: ([] as (string | null)[]).concat(current ?? []).filter((iso): iso is string => !!iso).map((iso) => parseDate(iso)),
    onValueChange: change,
    ...(min && { min: parseDate(min) }), ...(max && { max: parseDate(max) }),
    ...(unavailable && { isDateUnavailable: unavailable }),
    positioning: { placement },
    ...(t.zag.datePicker && { translations: t.zag.datePicker }),
    ...(inline && { inline: true }),
    // Inside a Field, its label points at the first input.
    ...(field && { ids: { label: () => field.ids.label, input: (index: number) => (index === 0 ? field.ids.control : `${field.ids.control}-${index}`) }, invalid: field.invalid }),
  })

  // A typed date it can't take: the reason, shown under the input and set as
  // its validity (so a form won't submit), until a date it takes is chosen.
  const [problem, setProblem] = useState<{ index: number, reason: string } | null>(null)
  const errorId = useId()
  function report(next: { index: number, reason: string } | null, input?: HTMLInputElement) {
    if (next) input?.setCustomValidity(next.reason)
    else document.querySelectorAll<HTMLInputElement>(`[data-error-for="${errorId}"]`).forEach((el) => el.setCustomValidity(''))
    if (next?.reason === problem?.reason && next?.index === problem?.index) return
    setProblem(next)
    onInvalidChange?.(next?.reason ?? null)
  }

  // Why a typed date can't be taken, or the date itself.
  const dateText = (date: DateValue) => new DateFormatter(locale).format(date.toDate(getLocalTimeZone()))
  function check(input: HTMLInputElement): { reason: string } | { date: DateValue } | null {
    const text = input.value.trim()
    if (!text) return null
    const pieces = text.split(pattern.separator)
    const date = pieces.length === pattern.fields.length && pieces.every((piece) => /^\d+$/.test(piece))
      ? parseDateString(text, locale, getLocalTimeZone()) : undefined
    if (!date) return { reason: t.datePicker.format(input.placeholder) }
    if (min && date.compare(parseDate(min)) < 0) return { reason: t.datePicker.min(dateText(parseDate(min))) }
    if (max && date.compare(parseDate(max)) > 0) return { reason: t.datePicker.max(dateText(parseDate(max))) }
    if (picker.isUnavailable(date)) return { reason: t.datePicker.unavailable }
    return { date }
  }

  // Takes the typed date, or reports why not (Zag would clamp or revert it).
  function commit(input: HTMLInputElement, index: number) {
    const result = check(input)
    if (!result) { report(null, input); return true }
    if ('reason' in result) { report({ index, ...result }, input); return false }
    report(null, input)
    const values = picker.value.slice()
    values[index] = result.date
    if (range && !values[1 - index]) values[1 - index] = result.date
    if (range && values[0] && values[1] && values[0].compare(values[1]) > 0) values.reverse()
    picker.setValue(values)
    return true
  }

  // Up/Down step an input's date by a day (Shift: a week), skipping unavailable
  // ones; in range mode the other end moves along so start never passes end.
  // Captured, so Zag's own key handling (which skips handled keys) stands aside.
  function step(e: KeyboardEvent<HTMLInputElement>, index: number) {
    // Enter takes the typed date only if it can (Zag shows "undefined" for a
    // part-typed one, 11/1); otherwise it reports why.
    if (e.key === 'Enter') {
      if (!commit(e.currentTarget, index)) e.preventDefault()
      return
    }
    const dir = ({ ArrowUp: 1, ArrowDown: -1 } as Record<string, number>)[e.key]
    if (!dir || e.altKey || e.metaKey || e.ctrlKey) return
    e.preventDefault()
    const values = picker.value.slice()
    let date: DateValue = values[index] ? values[index].add({ days: dir * (e.shiftKey ? 7 : 1) }) : today(getLocalTimeZone())
    for (let tries = 0; picker.isUnavailable(date); date = date.add({ days: dir })) if (++tries > 366) return
    values[index] = date
    if (range) {
      const other = 1 - index
      const crossed = values[other] && (index === 0 ? date.compare(values[1]) > 0 : date.compare(values[0]) < 0)
      if (!values[other] || crossed) values[other] = date
    }
    picker.setValue(values)
  }

  const view = picker.view

  const content = (
        <Ark.Content {...part('content')}>
          <Ark.View view={view} {...part('view')}>
            <Ark.ViewControl {...part('view-control')}>
              {prev ? <Ark.PrevTrigger asChild>{prev}</Ark.PrevTrigger>
                : <Ark.PrevTrigger {...part('prev-trigger')}><iconify-icon icon="lucide:chevron-left" /></Ark.PrevTrigger>}
              <Ark.ViewTrigger {...part('view-trigger')}>
                {view === 'day' ? picker.visibleRangeText.start
                  : view === 'month' ? picker.visibleRange.start.year
                  : `${picker.getDecade().start} – ${picker.getDecade().end}`}
              </Ark.ViewTrigger>
              {next ? <Ark.NextTrigger asChild>{next}</Ark.NextTrigger>
                : <Ark.NextTrigger {...part('next-trigger')}><iconify-icon icon="lucide:chevron-right" /></Ark.NextTrigger>}
            </Ark.ViewControl>

            {view === 'day' && (
              <Ark.Table {...part('table')}>
                <Ark.TableHead>
                  <Ark.TableRow>
                    {picker.weekDays.map((day, i) => <Ark.TableHeader key={i} {...part('table-header')} aria-label={day.long}>{day.narrow}</Ark.TableHeader>)}
                  </Ark.TableRow>
                </Ark.TableHead>
                <Ark.TableBody>
                  {picker.weeks.map((week, i) => (
                    <Ark.TableRow key={i}>
                      {week.map((date) => (
                        <Ark.TableCell key={date.toString()} value={date} {...part('table-cell')}>
                          <Ark.TableCellTrigger {...part('table-cell-trigger')}>{date.day}</Ark.TableCellTrigger>
                        </Ark.TableCell>
                      ))}
                    </Ark.TableRow>
                  ))}
                </Ark.TableBody>
              </Ark.Table>
            )}
            {view === 'month' && (
              <Ark.Table columns={4} {...part('table')}>
                <Ark.TableBody>
                  {picker.getMonthsGrid({ columns: 4, format: 'short' }).map((row, i) => (
                    <Ark.TableRow key={i}>
                      {row.map((month) => (
                        <Ark.TableCell key={month.value} value={month.value} columns={4} {...part('table-cell')}>
                          <Ark.TableCellTrigger {...part('table-cell-trigger')} data-wide="">{month.label}</Ark.TableCellTrigger>
                        </Ark.TableCell>
                      ))}
                    </Ark.TableRow>
                  ))}
                </Ark.TableBody>
              </Ark.Table>
            )}
            {view === 'year' && (
              <Ark.Table columns={4} {...part('table')}>
                <Ark.TableBody>
                  {picker.getYearsGrid({ columns: 4 }).map((row, i) => (
                    <Ark.TableRow key={i}>
                      {row.map((year) => (
                        <Ark.TableCell key={year.value} value={year.value} columns={4} {...part('table-cell')}>
                          <Ark.TableCellTrigger {...part('table-cell-trigger')} data-wide="">{year.label}</Ark.TableCellTrigger>
                        </Ark.TableCell>
                      ))}
                    </Ark.TableRow>
                  ))}
                </Ark.TableBody>
              </Ark.Table>
            )}
          </Ark.View>
        </Ark.Content>
  )

  return (
    <Ark.RootProvider value={picker} {...rest} {...part('root')} className={cx(className, classes?.root)} data-inline={inline || undefined}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      {!inline && <Ark.Control {...part('control')}>
        {/* Siblings, not wrapped: the CSS grows the last input (:last-of-type). */}
        {(range ? [0, 1] : [0]).map((index) => <Fragment key={index}>
          {index === 1 && <span {...part('separator')}>–</span>}
          <Ark.Input index={index} {...part('input')} size={10} fixOnBlur={false} data-error-for={errorId}
            onKeyDownCapture={(e) => step(e, index)} onInputCapture={(e) => separate(e, pattern)}
            onBlur={(e: FocusEvent<HTMLInputElement>) => commit(e.currentTarget, index)}
            aria-invalid={problem?.index === index || undefined}
            aria-describedby={[field?.ariaDescribedby, problem?.index === index && errorId].filter(Boolean).join(' ') || undefined} />
        </Fragment>)}
        <Ark.ClearTrigger {...part('clear-trigger')} onClick={() => report(null)}><iconify-icon icon="lucide:x" /></Ark.ClearTrigger>
        <Ark.Trigger {...part('trigger')}><iconify-icon icon="lucide:calendar" /></Ark.Trigger>
      </Ark.Control>}
      {problem && !inline && <div {...part('error')} id={errorId} role="alert">{problem.reason}</div>}

      {inline ? content : <Ark.Positioner {...part('positioner')}>{content}</Ark.Positioner>}
    </Ark.RootProvider>
  )
}

export const DatePicker = withParts(DatePickerShortcut, {
  Root: Ark.Root,
  RootProvider: Ark.RootProvider,
  Label: Ark.Label,
  Control: Ark.Control,
  Input: Ark.Input,
  ClearTrigger: Ark.ClearTrigger,
  Trigger: Ark.Trigger,
  Positioner: Ark.Positioner,
  Content: Ark.Content,
  View: Ark.View,
  ViewControl: Ark.ViewControl,
  PrevTrigger: Ark.PrevTrigger,
  ViewTrigger: Ark.ViewTrigger,
  NextTrigger: Ark.NextTrigger,
  RangeText: Ark.RangeText,
  Table: Ark.Table,
  TableHead: Ark.TableHead,
  TableHeader: Ark.TableHeader,
  TableBody: Ark.TableBody,
  TableRow: Ark.TableRow,
  TableCell: Ark.TableCell,
  TableCellTrigger: Ark.TableCellTrigger,
  PresetTrigger: Ark.PresetTrigger,
  Context: Ark.Context,
})

export { parseDate }
