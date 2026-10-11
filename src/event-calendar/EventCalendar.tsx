/**
 * A calendar of events by the hour: a day, a few days or a week across,
 * hours down, and optionally a column per resource (a vet, a tutor, a room)
 * within each day. Events sit by their times, side by side where they
 * overlap; all-day and multi-day events sit in a strip along the top.
 *
 *   <EventCalendar events={lessons} onSelect={book} onEventClick={open} onEventChange={update} />
 *   <EventCalendar view="day" resources={vets} slotMinutes={15} events={appointments} … />
 *
 * Times are local ISO strings ('2025-10-09T16:00'), as DatePicker's dates are;
 * an all-day event has dates only ('2025-10-09', its `end` the last day).
 *
 * - `events`: `{ id, title, start, end, allDay, resourceId, description,
 *   color, editable }`; `color` is 'accent' (default), 'success', 'warning',
 *   'danger', 'neutral' or any CSS colour; `editable: false` pins one
 * - `resources`: `{ id, title }` (and anything for `renderResource`): a
 *   column each, per day; events go in their `resourceId`'s column
 * - `view`, `defaultView`: 'day', 'week' (default), 'workweek', or a number
 *   of days from `date`; `onViewChange`. `views`: the toolbar's choices
 *   (['day', 'week']; [] for none). On a narrow screen it shows a day
 * - `date`, `defaultDate`: a day in the range shown (today's by default);
 *   `onDateChange`, from the toolbar (its title opens a calendar)
 * - `weekStartsOn`: 1 (Monday, default) or 0; `startHour`, `endHour` (7, 21);
 *   `slotMinutes`: what selecting, moving and resizing snap to (30);
 *   `hourHeight`: a CSS length ('3rem')
 * - `onSelect({ start, end, resourceId, allDay }, keys)`: an empty slot was
 *   clicked or a time dragged out, or (`allDay`) days in the all-day strip,
 *   e.g. to book it. `keys` says which of Shift, Alt, Ctrl and ⌘ were held
 *   (say, Shift to block time instead of booking it)
 * - `onEventClick(event)`
 * - `onEventChange(event, { start, end, resourceId }, { kind })`: makes
 *   events movable and resizable: drag one to another time, day or resource,
 *   or its bottom edge to change its length; or focus it and use ↑↓ (a slot),
 *   ←→ (a column), Shift+↑↓ (its length). The change spreads straight into
 *   the event (`{ ...event, ...change }`); `kind` is 'move' or 'resize', and
 *   comparing `resourceId` with the event's shows a change of resource.
 *   Update your events in response (or don't, and it stays where it was)
 * - `rows`: extra rows above the all-day strip, a cell per day (or per
 *   column with `perColumn`), e.g. the day's messages:
 *   `[{ key, label, render: (date, resource) => …, onClick: (date, resource) => … }]`
 * - `renderEvent(event, { start, end, resource, compact })`, `renderResource(resource)`,
 *   `renderDayHeader(date)`: draw those yourself
 * - `eventLabel(event)`: what screen readers call an event (its title, if text)
 * - `actions`: in the toolbar; `toolbar`: false hides it; `locale`
 */
import {
  Fragment, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode,
} from 'react'
import 'iconify-icon'
import { Button } from '../button/Button.js'
import { Popover } from '../popover/Popover.js'
import { DatePicker } from '../date-picker/DatePicker.js'
import { Segmented } from '../segment-group/Segmented.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { addDays, addMinutes, minutesOfDay, parse, sameDay, startOfWeek, toISODate, toISODateTime } from './dates.js'
import '../theme.css'
import './event-calendar.css'

type Id = string | number

export type CalendarEvent = {
  id: Id
  title: ReactNode
  start: string
  end: string
  allDay?: boolean
  resourceId?: Id
  description?: ReactNode
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | (string & {})
  editable?: boolean
}
export type CalendarResource = { id: Id, title: ReactNode }
export type CalendarView = 'day' | 'week' | 'workweek' | number
export type CalendarChange = { start: string, end: string, resourceId?: Id }
export type CalendarSelection = { start: string, end: string, resourceId?: Id, allDay: boolean }
export type CalendarKeys = { shiftKey: boolean, altKey: boolean, ctrlKey: boolean, metaKey: boolean }
export type CalendarRow<R extends CalendarResource = CalendarResource> = {
  key: string
  label: ReactNode
  render?: (date: Date, resource: R | null) => ReactNode
  onClick?: (date: Date, resource: R | null) => void
  perColumn?: boolean
}

export type EventCalendarProps<E extends CalendarEvent = CalendarEvent, R extends CalendarResource = CalendarResource> =
  Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> & {
    events?: E[]
    resources?: R[] | null
    view?: CalendarView
    defaultView?: CalendarView
    onViewChange?: (view: CalendarView) => void
    views?: CalendarView[]
    date?: string
    defaultDate?: string
    onDateChange?: (date: string) => void
    weekStartsOn?: 0 | 1
    startHour?: number
    endHour?: number
    slotMinutes?: number
    hourHeight?: string
    onSelect?: (selection: CalendarSelection, keys: CalendarKeys) => void
    rows?: CalendarRow<R>[]
    onEventClick?: (event: E) => void
    onEventChange?: (event: E, change: CalendarChange, how: { kind: 'move' | 'resize' }) => void
    renderEvent?: (event: E, state: { start: Date, end: Date, resource: R | null, compact: boolean }) => ReactNode
    renderResource?: (resource: R) => ReactNode
    renderDayHeader?: (date: Date) => ReactNode
    eventLabel?: (event: E) => string
    actions?: ReactNode
    toolbar?: boolean
    locale?: string
    classes?: Classes<'root' | 'toolbar' | 'nav' | 'title' | 'grid' | 'corner' | 'dayHeader' | 'resourceHeader' | 'allDayLabel'
      | 'allDay' | 'allDayEvent' | 'gutter' | 'hour' | 'day' | 'event' | 'eventTitle' | 'eventTime' | 'resize' | 'selection' | 'now' | 'status' | 'rowLabel' | 'rowCell'>
  }

const named = ['accent', 'success', 'warning', 'danger', 'neutral']
const viewLabel = (view: CalendarView) => view === 'day' ? 'Day' : view === 'week' ? 'Week' : view === 'workweek' ? 'Work week' : `${view} days`

type Column<R> = { date: Date, iso: string, resource: R | null }
type Placed<E> = { event: E, start: Date, end: Date, column: number, columns: number }

const isAllDay = (event: CalendarEvent) => event.allDay || !event.start.includes('T')
  || event.start.slice(0, 10) !== event.end.slice(0, 10)

// A day's events, side by side where they overlap: each takes the first
// free column in its cluster of overlapping events.
function place<E extends CalendarEvent>(events: E[]): Placed<E>[] {
  const sorted = events.map((event) => ({ event, start: parse(event.start), end: parse(event.end) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime())
  const placed: Placed<E>[] = []
  let cluster: Placed<E>[] = []
  let clusterEnd = 0
  const close = () => {
    const columns = Math.max(1, ...cluster.map((p) => p.column + 1))
    cluster.forEach((p) => { p.columns = columns })
    cluster = []
  }
  for (const item of sorted) {
    if (cluster.length && item.start.getTime() >= clusterEnd) close()
    const taken = cluster.filter((p) => p.end > item.start).map((p) => p.column)
    let column = 0
    while (taken.includes(column)) column++
    const entry = { ...item, column, columns: 1 }
    cluster.push(entry)
    placed.push(entry)
    clusterEnd = Math.max(clusterEnd, item.end.getTime())
  }
  close()
  return placed
}

// What a pointer is doing: drawing out a selection, or moving or resizing an event.
type Gesture<E> = {
  kind: 'select' | 'move' | 'resize' | 'all-day', column: number, x: number, y: number, top: number, height: number, width: number,
  left: number, from: number, moved: boolean, keys: CalendarKeys, event?: E,
}
type Preview = { kind: 'select', column: number, from: number, to: number }
  | { kind: 'all-day', columns: number[] }
  | { kind: 'move', id: Id, columns: number, minutes: number, x: number, y: number }
  | { kind: 'resize', id: Id, minutes: number }

export function EventCalendar<E extends CalendarEvent = CalendarEvent, R extends CalendarResource = CalendarResource>({
  events = [], resources = null, view: viewProp, defaultView = 'week', onViewChange, views = ['day', 'week'],
  date: dateProp, defaultDate, onDateChange, weekStartsOn = 1, startHour = 7, endHour = 21, slotMinutes = 30, hourHeight = '3rem',
  onSelect, rows = [], onEventClick, onEventChange, renderEvent, renderResource, renderDayHeader, eventLabel, actions = null, toolbar = true,
  locale, className, classes, style, ...rest
}: EventCalendarProps<E, R>) {
  const part = partsOf('event-calendar', classes)
  const [today] = useState(() => toISODate(new Date()))
  const [date, setDate] = useControllable(dateProp, defaultDate ?? today, onDateChange)
  const [chosenView, setView] = useControllable<CalendarView>(viewProp, defaultView, onViewChange)

  // Narrow (a phone): a day at a time.
  const root = useRef<HTMLDivElement>(null)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new ResizeObserver(() => setNarrow(el.clientWidth < 640))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const view = narrow ? 'day' : chosenView

  // The days shown, and how far the arrows go.
  const current = parse(date)
  const first = view === 'week' ? startOfWeek(current, weekStartsOn) : view === 'workweek' ? startOfWeek(current, 1) : current
  const count = view === 'day' ? 1 : view === 'week' ? 7 : view === 'workweek' ? 5 : Math.max(1, view)
  const step = view === 'week' || view === 'workweek' ? 7 : count
  const dates = Array.from({ length: count }, (_, i) => addDays(first, i))
  const lanes = resources?.length ? resources : [null]
  const columns: Column<R>[] = dates.flatMap((d) => lanes.map((resource) => ({ date: d, iso: toISODate(d), resource })))
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const span = (endHour - startHour) * 60

  // The time now, for the line across today; moved on each minute.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const dayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const longDay = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  const hourFormat = new Intl.DateTimeFormat(locale, { hour: 'numeric' })
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' })
  const title = count === 1
    ? new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(first)
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).formatRange(first, dates[count - 1])
  const top = (minutes: number) => `${((minutes - startHour * 60) / span) * 100}%`
  const snap = (minutes: number) => Math.floor(minutes / slotMinutes) * slotMinutes
  const nameOf = (event: E) => eventLabel ? eventLabel(event) : typeof event.title === 'string' ? event.title : 'Event'
  const columnOf = (event: E, iso: string) => columns.findIndex((c) => c.iso === iso && (!resources?.length || c.resource?.id === event.resourceId))

  const [picking, setPicking] = useState(false)
  const [status, setStatus] = useState('')

  // ---- Changing events: by pointer (previewed until it's dropped) or by keyboard.
  const grid = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture<E> | null>(null)
  const [preview, setPreviewState] = useState<Preview | null>(null)
  // Also kept in a ref: a quick click ends before React renders the preview it set.
  const latestPreview = useRef<Preview | null>(null)
  const setPreview = (next: Preview | null) => {
    latestPreview.current = next
    setPreviewState(next)
  }
  const refocus = useRef<Id | null>(null)
  const suppressClick = useRef(false)

  // An event moved by `byColumns` and `byMinutes`, or resized by `byMinutes`.
  function change(event: E, kind: 'move' | 'resize', byColumns: number, byMinutes: number) {
    const start = parse(event.start)
    const end = parse(event.end)
    let next: { start: Date, end: Date, column: Column<R> }
    const from = columnOf(event, event.start.slice(0, 10))
    if (kind === 'resize') {
      const newEnd = addMinutes(end, byMinutes)
      if (newEnd.getTime() - start.getTime() < slotMinutes * 60000) return
      next = { start, end: newEnd, column: columns[from] }
    } else {
      const target = columns[Math.max(0, Math.min(columns.length - 1, from + byColumns))]
      if (!target) return
      const days = Math.round((target.date.getTime() - columns[from].date.getTime()) / 86400000)
      next = { start: addMinutes(addDays(start, days), byMinutes), end: addMinutes(addDays(end, days), byMinutes), column: target }
    }
    refocus.current = event.id
    const who = next.column?.resource ? `, ${typeof next.column.resource.title === 'string' ? next.column.resource.title : ''}` : ''
    setStatus(kind === 'resize'
      ? `${nameOf(event)} now ends at ${timeFormat.format(next.end)}.`
      : `${nameOf(event)} moved to ${longDay.format(next.start)}, ${timeFormat.format(next.start)}${who}.`)
    onEventChange?.(event, {
      start: toISODateTime(next.start), end: toISODateTime(next.end),
      ...(next.column?.resource && { resourceId: next.column.resource.id }),
    }, { kind })
  }

  function begin(e: PointerEvent<HTMLElement>, kind: Gesture<E>['kind'], column: number, event?: E) {
    if (e.button !== 0) return
    e.stopPropagation()
    const keys = { shiftKey: e.shiftKey, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* not a live pointer */ }
    if (kind === 'all-day') {
      // The strip spans every column: which one is under the pointer.
      const box = e.currentTarget.getBoundingClientRect()
      const width = box.width / columns.length
      const at = Math.max(0, Math.min(columns.length - 1, Math.floor((e.clientX - box.left) / width)))
      gesture.current = { kind, column: at, x: e.clientX, y: e.clientY, top: box.top, height: box.height, width, left: box.left, from: at, moved: false, keys }
      setPreview({ kind: 'all-day', columns: [at] })
      return
    }
    const box = e.currentTarget.closest('[data-part=day]')!.getBoundingClientRect()
    const from = startHour * 60 + snap(((e.clientY - box.top) / box.height) * span)
    gesture.current = { kind, column, x: e.clientX, y: e.clientY, top: box.top, height: box.height, width: box.width, left: box.left, from, moved: false, keys, event }
    if (kind === 'select') setPreview({ kind: 'select', column, from, to: from + slotMinutes })
  }

  // The columns from one to another (with resources, only the first one's resource).
  const columnRange = (a: number, b: number) => {
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    return columns.map((_, i) => i).filter((i) => i >= lo && i <= hi && columns[i].resource === columns[a].resource)
  }

  function track(e: PointerEvent) {
    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    if (!g.moved && Math.hypot(dx, dy) < 4) return
    g.moved = true
    const perMinute = g.height / span
    if (g.kind === 'all-day') {
      const at = Math.max(0, Math.min(columns.length - 1, Math.floor((e.clientX - g.left) / g.width)))
      setPreview({ kind: 'all-day', columns: columnRange(g.from, at) })
    } else if (g.kind === 'select') {
      const at = startHour * 60 + snap(Math.max(0, Math.min(span - 1, ((e.clientY - g.top) / g.height) * span)))
      setPreview({ kind: 'select', column: g.column, from: Math.min(g.from, at), to: Math.max(g.from, at) + slotMinutes })
    } else if (g.kind === 'move') {
      const byColumns = Math.round(dx / g.width)
      const byMinutes = Math.round(dy / perMinute / slotMinutes) * slotMinutes
      setPreview({ kind: 'move', id: g.event!.id, columns: byColumns, minutes: byMinutes, x: byColumns * g.width, y: byMinutes * perMinute })
    } else {
      setPreview({ kind: 'resize', id: g.event!.id, minutes: Math.round(dy / perMinute / slotMinutes) * slotMinutes })
    }
  }

  function end() {
    const g = gesture.current
    gesture.current = null
    const p = latestPreview.current
    setPreview(null)
    if (!g) return
    if (g.kind === 'select' && p?.kind === 'select') {
      const column = columns[g.column]
      const start = addMinutes(column.date, p.from)
      const finish = addMinutes(column.date, p.to)
      setStatus(`Selected ${longDay.format(start)}, ${timeFormat.format(start)} to ${timeFormat.format(finish)}.`)
      onSelect?.({ start: toISODateTime(start), end: toISODateTime(finish), allDay: false, ...(column.resource && { resourceId: column.resource.id }) }, g.keys)
      return
    }
    if (g.kind === 'all-day' && p?.kind === 'all-day') {
      const first = columns[p.columns[0]]
      const last = columns[p.columns[p.columns.length - 1]]
      setStatus(p.columns.length > 1
        ? `Selected ${longDay.format(first.date)} to ${longDay.format(last.date)}, all day.`
        : `Selected ${longDay.format(first.date)}, all day.`)
      onSelect?.({ start: first.iso, end: last.iso, allDay: true, ...(first.resource && { resourceId: first.resource.id }) }, g.keys)
      return
    }
    if (!g.moved || !g.event) return
    // The click that follows a drag isn't a click on the event.
    suppressClick.current = true
    if (p?.kind === 'move' && (p.columns || p.minutes)) change(g.event, 'move', p.columns, p.minutes)
    if (p?.kind === 'resize' && p.minutes) change(g.event, 'resize', 0, p.minutes)
  }

  function cancel() {
    gesture.current = null
    setPreview(null)
  }

  function keyDown(e: KeyboardEvent, event: E) {
    if (!onEventChange || event.editable === false) return
    const keys: Record<string, [number, number]> = { ArrowUp: [0, -slotMinutes], ArrowDown: [0, slotMinutes], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
    const move = keys[e.key]
    if (!move) return
    e.preventDefault()
    if (e.shiftKey && move[0] === 0) change(event, 'resize', 0, move[1])
    else change(event, 'move', move[0], move[1])
  }

  // A moved event lands in another column (a new element): focus it again.
  useEffect(() => {
    if (refocus.current == null) return
    grid.current?.querySelector<HTMLElement>(`[data-event-id="${CSS.escape(String(refocus.current))}"]`)?.focus()
    refocus.current = null
  })

  // ---- All-day and multi-day events: bars across the columns they cover, in lanes.
  const allDay = events.filter(isAllDay).flatMap((event) => {
    const from = event.start.slice(0, 10)
    const to = event.end.slice(0, 10)
    const covered = columns.map((c, i) => (c.iso >= from && c.iso <= to && (!resources?.length || c.resource?.id === event.resourceId) ? i : -1))
      .filter((i) => i >= 0)
    // Runs of neighbouring columns (with resources, a day's column for the event's resource).
    const runs: number[][] = []
    for (const i of covered) {
      const run = runs[runs.length - 1]
      if (run && run[run.length - 1] === i - 1) run.push(i)
      else runs.push([i])
    }
    return runs.map((run) => ({ event, first: run[0], length: run.length, lane: 0 }))
  })
  allDay.sort((a, b) => a.first - b.first || b.length - a.length)
  const laneEnds: number[] = []
  for (const bar of allDay) {
    let lane = laneEnds.findIndex((endAt) => endAt < bar.first)
    if (lane < 0) lane = laneEnds.length
    laneEnds[lane] = bar.first + bar.length - 1
    bar.lane = lane
  }

  const twoRows = !!resources?.length && count > 1
  const editable = (event: E) => !!onEventChange && event.editable !== false

  return (
    <div {...rest} {...part('root')} ref={root} className={cx(className, classes?.root)}
      style={{ ...style, '--columns': columns.length, '--hour-height': hourHeight } as CSSProperties}>
      {toolbar && (
        <div {...part('toolbar')}>
          <div {...part('nav')}>
            <Button size="sm" onClick={() => setDate(today)}>Today</Button>
            <Button size="sm" variant="ghost" icon="lucide:chevron-left" aria-label="Previous" onClick={() => setDate(toISODate(addDays(current, -step)))} />
            <Button size="sm" variant="ghost" icon="lucide:chevron-right" aria-label="Next" onClick={() => setDate(toISODate(addDays(current, step)))} />
          </div>
          {/* The title opens a month, to jump to any date. */}
          <Popover placement="bottom-start" open={picking} onOpenChange={setPicking} trigger={
            <button type="button" {...part('title')} aria-label={`${title}: pick a date`}>
              {title}<iconify-icon icon="lucide:chevron-down" aria-hidden="true" />
            </button>
          }>
            <DatePicker inline value={date} onValueChange={(value) => { if (value) { setDate(value); setPicking(false) } }} />
          </Popover>
          <div {...part('actions')}>
            {!narrow && views.length > 1 && (
              <Segmented size="sm" aria-label="View" items={views.map((v) => ({ value: String(v), label: viewLabel(v) }))}
                value={String(chosenView)} onValueChange={(v) => v && setView(/^\d+$/.test(v) ? Number(v) : v as CalendarView)} />
            )}
            {actions}
          </div>
        </div>
      )}

      <div {...part('grid')} ref={grid} role="grid" aria-label={title} data-two-rows={twoRows || undefined}>
        {/* Headers: the days (spanning their resources), then the resources. */}
        <div {...part('corner')} style={{ gridRow: twoRows ? 'span 2' : undefined }} />
        {(!resources?.length || count > 1) && dates.map((d) => (
          <div key={toISODate(d)} {...part('day-header')} role="columnheader" data-today={sameDay(d, now) || undefined}
            style={{ gridColumn: `span ${lanes.length}` }}>
            {renderDayHeader ? renderDayHeader(d) : <><span>{dayFormat.format(d)}</span><strong>{d.getDate()}</strong></>}
          </div>
        ))}
        {!!resources?.length && columns.map((c) => (
          <div key={`${c.iso}-${c.resource!.id}`} {...part('resource-header')} role="columnheader">
            {renderResource ? renderResource(c.resource!) : c.resource!.title}
          </div>
        ))}

        {rows.map((row) => <Fragment key={row.key}>
          <div {...part('row-label')}>{row.label}</div>
          {(row.perColumn ? columns : dates.map((d) => ({ date: d, iso: toISODate(d), resource: null }))).map((cell) => {
            const content = row.render?.(cell.date, cell.resource as R | null)
            const key = `${cell.iso}-${cell.resource?.id ?? ''}`
            const style = { gridColumn: row.perColumn ? undefined : `span ${lanes.length}` }
            return row.onClick
              // The whole cell adds (say, a message); what's in it opens its own (stopPropagation in your render).
              ? <div key={key} {...part('row-cell')} style={style} data-clickable="" role="button" tabIndex={0}
                  aria-label={`${typeof row.label === 'string' ? row.label : ''} ${longDay.format(cell.date)}`}
                  onClick={() => row.onClick!(cell.date, cell.resource as R | null)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.onClick!(cell.date, cell.resource as R | null) } }}>{content}</div>
              : <div key={key} {...part('row-cell')} style={style}>{content}</div>
          })}
        </Fragment>)}

        {(allDay.length > 0 || onSelect) && <>
          <div {...part('all-day-label')}>All day</div>
          <div {...part('all-day')} style={{ '--lanes': Math.max(1, laneEnds.length) } as CSSProperties}
            data-selectable={onSelect ? '' : undefined}
            onPointerDown={(e) => { if (onSelect && e.target === e.currentTarget) begin(e, 'all-day', 0) }}
            onPointerMove={track} onPointerUp={end} onPointerCancel={cancel}>
            {preview?.kind === 'all-day' && preview.columns.map((i) => (
              <div key={i} {...part('selection')} data-all-day="" style={{ left: `${(i / columns.length) * 100}%`, width: `${100 / columns.length}%` }} />
            ))}
            {allDay.map(({ event, first, length, lane }) => (
              <button key={`${event.id}-${first}`} type="button" {...part('all-day-event')} data-color={named.includes(event.color ?? 'accent') ? event.color ?? 'accent' : 'custom'}
                style={{
                  left: `${(first / columns.length) * 100}%`, width: `${(length / columns.length) * 100}%`, top: `calc(${lane} * 1.625rem + 0.25rem)`,
                  ...(event.color && !named.includes(event.color) && { '--event-color': event.color }),
                } as CSSProperties}
                onClick={() => onEventClick?.(event)}>
                {renderEvent ? renderEvent(event, { start: parse(event.start), end: parse(event.end), resource: null, compact: true }) : event.title}
              </button>
            ))}
          </div>
        </>}

        <div {...part('gutter')} aria-hidden="true" style={{ '--hours': hours.length } as CSSProperties}>
          {hours.map((hour) => <span key={hour} {...part('hour')} style={{ top: top(hour * 60) }}>{hourFormat.format(new Date(2000, 0, 1, hour))}</span>)}
        </div>
        {columns.map((column, index) => {
          const own = events.filter((event) => !isAllDay(event) && event.start.startsWith(column.iso)
            && (!resources?.length || event.resourceId === column.resource?.id))
          const selecting = preview?.kind === 'select' && preview.column === index ? preview : null
          const isToday = sameDay(column.date, now)
          return (
            <div key={`${column.iso}-${column.resource?.id ?? ''}`} {...part('day')} role="gridcell"
              aria-label={`${longDay.format(column.date)}${column.resource && typeof column.resource.title === 'string' ? `, ${column.resource.title}` : ''}`}
              data-today={isToday || undefined} data-selectable={onSelect ? '' : undefined}
              data-first={(!!resources?.length && column.resource === lanes[0]) || undefined}
              style={{ '--hours': hours.length } as CSSProperties}
              onPointerDown={(e) => { if (onSelect && e.target === e.currentTarget) begin(e, 'select', index) }}
              onPointerMove={track} onPointerUp={end} onPointerCancel={cancel}>
              {place(own).map(({ event, start, end: finish, column: sub, columns: subs }) => {
                const moving = preview?.kind === 'move' && preview.id === event.id ? preview : null
                const resizing = preview?.kind === 'resize' && preview.id === event.id ? preview : null
                const shownEnd = resizing ? addMinutes(finish, resizing.minutes) : finish
                const minutes = (shownEnd.getTime() - start.getTime()) / 60000
                const color = event.color ?? 'accent'
                const time = `${timeFormat.format(start)} – ${timeFormat.format(shownEnd)}`
                return (
                  <button key={event.id} type="button" {...part('event')} data-event-id={event.id}
                    data-dragging={moving || resizing ? '' : undefined} data-editable={editable(event) || undefined}
                    data-compact={minutes <= 30 || undefined} data-color={named.includes(color) ? color : 'custom'}
                    aria-label={`${nameOf(event)}, ${time}`}
                    style={{
                      top: top(minutesOfDay(start)), height: `${(Math.max(slotMinutes, minutes) / span) * 100}%`,
                      left: `${(sub / subs) * 100}%`, width: `${100 / subs}%`,
                      ...(!named.includes(color) && { '--event-color': color }),
                      ...(moving && { transform: `translate(${moving.x}px, ${moving.y}px)` }),
                    } as CSSProperties}
                    onPointerDown={(e) => { if (editable(event)) begin(e, 'move', index, event); else e.stopPropagation() }}
                    onPointerMove={track} onPointerUp={end} onPointerCancel={cancel}
                    onKeyDown={(e) => keyDown(e, event)}
                    onClick={() => { if (suppressClick.current) suppressClick.current = false; else onEventClick?.(event) }}>
                    {renderEvent ? renderEvent(event, { start, end: shownEnd, resource: column.resource, compact: minutes <= 30 }) : <>
                      <span {...part('event-title')}>{event.title}</span>
                      <span {...part('event-time')}>{time}</span>
                    </>}
                    {editable(event) && (
                      <span {...part('resize')} aria-hidden="true"
                        onPointerDown={(e) => begin(e, 'resize', index, event)} onPointerMove={track} onPointerUp={end} onPointerCancel={cancel} />
                    )}
                  </button>
                )
              })}
              {selecting && (
                <div {...part('selection')} style={{ top: top(selecting.from), height: `${((selecting.to - selecting.from) / span) * 100}%` }}>
                  {timeFormat.format(addMinutes(column.date, selecting.from))} – {timeFormat.format(addMinutes(column.date, selecting.to))}
                </div>
              )}
              {isToday && minutesOfDay(now) >= startHour * 60 && minutesOfDay(now) < endHour * 60 && (
                <div {...part('now')} style={{ top: top(minutesOfDay(now)) }} aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>
      <div {...part('status')} aria-live="polite" role="status">{status}</div>
    </div>
  )
}
