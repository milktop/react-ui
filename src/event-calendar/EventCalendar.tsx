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
 * Events and resources
 * - `events`: `{ id, title, start, end, allDay, resourceId, description,
 *   color, editable, blocked, pending }`; `color` is 'accent' (default),
 *   'success', 'warning', 'danger', 'neutral' or any CSS colour;
 *   `editable: false` fixes one; `blocked` draws it hatched (time taken out,
 *   not an appointment); `pending` faded and fixed (saving)
 * - `resources`: `{ id, title }` (and anything for `renderResource`): a
 *   column each, per day; events go in their `resourceId`'s column
 *
 * What's shown
 * - `view`, `defaultView`: 'day', 'week' (default), 'workweek', or a number
 *   of days from `date`; `onViewChange`. `views`: the toolbar's choices
 *   (['day', 'week']; [] for none). On a narrow screen it shows a day
 * - `date`, `defaultDate`: a day in the range shown (today's by default);
 *   `onDateChange`, from the toolbar (its title opens a calendar)
 * - `weekStartsOn`: 1 (Monday, default) or 0; `startHour`, `endHour` (7, 21);
 *   `slotMinutes`: what selecting, moving and resizing snap to (30);
 *   `hourHeight`: a CSS length ('3rem')
 * - `height`: a CSS length: the hours scroll inside it under the headers;
 *   `scrollToTime`: where it opens scrolled to ('08:00', or 'now'), once
 * - `rows`: extra rows above the all-day strip, a cell per day (or per
 *   column with `perColumn`), e.g. the day's messages:
 *   `[{ key, label, render: (date, resource) => …, onClick: (date, resource) => … }]`
 * - `allDayMax`: all-day lanes shown before a "+2 more" (3)
 *
 * Changing things
 * - `onSelect({ start, end, resourceId, allDay }, keys)`: an empty slot was
 *   clicked or a time dragged out, or (`allDay`) days in the all-day strip,
 *   e.g. to book it. `keys` says which of Shift, Alt, Ctrl and ⌘ were held
 *   (say, Shift to block time instead of booking it)
 * - `onEventClick(event)`: an event was clicked (not dragged), e.g. to open it
 * - `onDayClick(date)`: a day's header was clicked (an ISO date), e.g. to show
 *   that day; `onResourceClick(resource, date)`: a resource's header
 * - `onRangeChange({ start, end, view })`: the days shown, as ISO dates (the
 *   last one included), when it first shows and whenever they change: load
 *   that range's events from your server
 * - `onEventChange(event, { start, end, resourceId }, { kind })`: makes
 *   events movable and resizable: drag one to another time, day or resource,
 *   or its bottom edge to change its length; or focus it and use ↑↓ (a slot),
 *   ←→ (a column), Shift+↑↓ (its length). The change spreads straight into
 *   the event (`{ ...event, ...change }`); `kind` is 'move' or 'resize', and
 *   comparing `resourceId` with the event's shows a change of resource.
 *   Update your events in response (or don't, and it stays where it was)
 * - `isAvailable({ start, end, resourceId, allDay, event })`: true, or false
 *   or the reason it isn't ('Dr Patel is away'): unavailable time is shaded
 *   (the reason on hover) and selecting, moving or resizing into it is
 *   refused, calling `onUnavailable(reason, attempt)` (to show a toast).
 *   `event` is the one being moved, so it doesn't clash with itself;
 *   `shading` is true when it's only asking what to shade (so clashes with
 *   other events, which show anyway, can be left to bookings and drops)
 * - `pinned`: an event being placed (it can be from another week): while
 *   set, a click on a time moves it there (through `onEventChange`, keeping
 *   its length); Escape or the bar's Cancel call `onPinnedChange(null)`.
 *   Clear it once you've moved it
 *
 * - `eventMenu(event)`, `slotMenu(slot)`: items for a menu on right-click
 *   (or the Menu key, or Shift+F10, on a focused event): of an event, or of
 *   an empty time or all-day day (`slot` is `{ start, end, resourceId, allDay }`).
 *   Items are `{ label, icon, shortcut, danger, disabled, onSelect }`, or
 *   `{ separator: true }`, or `{ group: 'Heading' }`; return nothing for no menu
 *
 * Drawing and words
 * - `renderEvent(event, { start, end, resource, compact })`, `renderResource(resource)`,
 *   `renderDayHeader(date)`: draw those yourself
 * - `eventLabel(event)`: what screen readers call an event (its title, if text)
 * - `translations`: its words (Today, All day, the views, the announcements…);
 *   `locale`: for the dates and times
 * - `actions`: in the toolbar; `toolbar`: false hides it
 */
import {
  Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type PointerEvent,
  type ReactNode,
} from 'react'
import 'iconify-icon'
import { Button } from '../button/Button.js'
import { Popover } from '../popover/Popover.js'
import { DatePicker } from '../date-picker/DatePicker.js'
import { Segmented } from '../segment-group/Segmented.js'
import { Menu, type MenuEntry } from '../menu/Menu.js'
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
  blocked?: boolean
  pending?: boolean
}
export type CalendarResource = { id: Id, title: ReactNode }
export type CalendarView = 'day' | 'week' | 'workweek' | number
export type CalendarChange = { start: string, end: string, resourceId?: Id }
export type CalendarSelection = { start: string, end: string, resourceId?: Id, allDay: boolean }
export type CalendarKeys = { shiftKey: boolean, altKey: boolean, ctrlKey: boolean, metaKey: boolean }
export type CalendarQuery<E extends CalendarEvent = CalendarEvent> = CalendarSelection & { event?: E, shading?: boolean }
export type CalendarRow<R extends CalendarResource = CalendarResource> = {
  key: string
  label: ReactNode
  render?: (date: Date, resource: R | null) => ReactNode
  onClick?: (date: Date, resource: R | null) => void
  perColumn?: boolean
}

export type CalendarMenuItem = {
  label?: ReactNode, icon?: string, shortcut?: string, danger?: boolean, disabled?: boolean,
  separator?: boolean, group?: ReactNode, onSelect?: () => void,
}

export type CalendarTranslations = {
  today: string, previous: string, next: string, allDay: string, view: string, pickDate: string,
  day: string, week: string, workweek: string, days: (count: number) => string,
  more: (count: number) => string, less: string, unavailable: string, cancel: string,
  placing: (name: string) => string,
  selected: (when: string) => string, moved: (name: string, when: string) => string, resized: (name: string, time: string) => string,
}
const english: CalendarTranslations = {
  today: 'Today', previous: 'Previous', next: 'Next', allDay: 'All day', view: 'View', pickDate: 'pick a date',
  day: 'Day', week: 'Week', workweek: 'Work week', days: (count) => `${count} days`,
  more: (count) => `+${count} more`, less: 'Show less', unavailable: 'Not available', cancel: 'Cancel',
  placing: (name) => `Placing ${name}: click a time, or press Escape to cancel.`,
  selected: (when) => `Selected ${when}.`, moved: (name, when) => `${name} moved to ${when}.`, resized: (name, time) => `${name} now ends at ${time}.`,
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
    height?: string | null
    scrollToTime?: string | null
    rows?: CalendarRow<R>[]
    allDayMax?: number
    onSelect?: (selection: CalendarSelection, keys: CalendarKeys) => void
    onEventClick?: (event: E) => void
    onDayClick?: (date: string) => void
    onResourceClick?: (resource: R, date: string) => void
    onRangeChange?: (range: { start: string, end: string, view: CalendarView }) => void
    onEventChange?: (event: E, change: CalendarChange, how: { kind: 'move' | 'resize' }) => void
    isAvailable?: (query: CalendarQuery<E>) => boolean | string
    onUnavailable?: (reason: string, attempt: CalendarQuery<E>) => void
    pinned?: E | null
    eventMenu?: (event: E) => CalendarMenuItem[] | null | undefined
    slotMenu?: (slot: CalendarSelection) => CalendarMenuItem[] | null | undefined
    onPinnedChange?: (event: E | null) => void
    renderEvent?: (event: E, state: { start: Date, end: Date, resource: R | null, compact: boolean }) => ReactNode
    renderResource?: (resource: R) => ReactNode
    renderDayHeader?: (date: Date) => ReactNode
    eventLabel?: (event: E) => string
    translations?: Partial<CalendarTranslations>
    actions?: ReactNode
    toolbar?: boolean
    locale?: string
    classes?: Classes<'root' | 'toolbar' | 'nav' | 'title' | 'actions' | 'pinned' | 'grid' | 'corner' | 'dayHeader' | 'resourceHeader'
      | 'rowLabel' | 'rowCell' | 'allDayLabel' | 'allDay' | 'allDayEvent' | 'more' | 'gutter' | 'hour' | 'day' | 'unavailable'
      | 'event' | 'eventTitle' | 'headerButton' | 'eventTime' | 'resize' | 'ghost' | 'selection' | 'now' | 'status'>
  }

const named = ['accent', 'success', 'warning', 'danger', 'neutral']
// The menu's hidden trigger (Zag marks it as its context trigger, so no part of ours).
const menuAnchorStyle: CSSProperties = { position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }

type Column<R> = { date: Date, iso: string, resource: R | null }
type Placed<E> = { event: E, start: Date, end: Date, column: number, columns: number }

const isAllDay = (event: CalendarEvent) => event.allDay || !event.start.includes('T')
  || event.start.slice(0, 10) !== event.end.slice(0, 10)
const minutesBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 60000)

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
  kind: 'select' | 'move' | 'resize' | 'all-day' | 'place', column: number, x: number, y: number, top: number, height: number,
  width: number, left: number, from: number, moved: boolean, keys: CalendarKeys, event?: E,
}
type Preview = { kind: 'select', column: number, from: number, to: number }
  | { kind: 'all-day', columns: number[] }
  | { kind: 'move', id: Id, columns: number, minutes: number, x: number, y: number }
  | { kind: 'resize', id: Id, minutes: number }
  | { kind: 'place', column: number, from: number }

export function EventCalendar<E extends CalendarEvent = CalendarEvent, R extends CalendarResource = CalendarResource>({
  events = [], resources = null, view: viewProp, defaultView = 'week', onViewChange, views = ['day', 'week'],
  date: dateProp, defaultDate, onDateChange, weekStartsOn = 1, startHour = 7, endHour = 21, slotMinutes = 30, hourHeight = '3rem',
  height = null, scrollToTime = null, rows = [], allDayMax = 3, onSelect, onEventClick, onDayClick, onResourceClick, onRangeChange, onEventChange, isAvailable, onUnavailable,
  pinned = null, onPinnedChange, eventMenu, slotMenu, renderEvent, renderResource, renderDayHeader, eventLabel, translations, actions = null, toolbar = true,
  locale, className, classes, style, ...rest
}: EventCalendarProps<E, R>) {
  const part = partsOf('event-calendar', classes)
  const t = { ...english, ...translations }
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
  const viewLabel = (v: CalendarView) => v === 'day' ? t.day : v === 'week' ? t.week : v === 'workweek' ? t.workweek : t.days(v)

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

  // The days shown, reported when they change (to load their events).
  const rangeStart = toISODate(dates[0])
  const rangeEnd = toISODate(dates[dates.length - 1])
  const reportRange = useRef(onRangeChange)
  useEffect(() => { reportRange.current = onRangeChange })
  useEffect(() => { reportRange.current?.({ start: rangeStart, end: rangeEnd, view }) }, [rangeStart, rangeEnd, view])

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
  const length = (minutes: number) => `${(minutes / span) * 100}%`
  const snap = (minutes: number) => Math.floor(minutes / slotMinutes) * slotMinutes
  const nameOf = (event: E) => eventLabel ? eventLabel(event) : typeof event.title === 'string' ? event.title : 'Event'
  const resourceName = (column: Column<R> | undefined) =>
    column?.resource && typeof column.resource.title === 'string' ? `, ${column.resource.title}` : ''
  const columnOf = (event: E, iso: string) => columns.findIndex((c) => c.iso === iso && (!resources?.length || c.resource?.id === event.resourceId))

  const [picking, setPicking] = useState(false)
  const [status, setStatus] = useState('')
  const [allDayOpen, setAllDayOpen] = useState(false)

  // ---- One menu, opened where it's wanted (right-click, or the keyboard).
  // It opens through a hidden context-menu trigger: a contextmenu event sent to
  // it at the point is how Zag places a menu there.
  const [menu, setMenu] = useState<{ entries: MenuEntry[], actions: (() => void)[] }>({ entries: [], actions: [] })
  const menuAnchor = useRef<HTMLSpanElement>(null)
  const menuPoint = useRef<{ x: number, y: number } | null>(null)
  function openMenu(x: number, y: number, items: CalendarMenuItem[] | null | undefined) {
    if (!items?.length) return false
    const actions: (() => void)[] = []
    const entries: MenuEntry[] = items.map((item) => item.separator ? { separator: true } : item.group ? { group: item.group } : {
      label: item.label, icon: item.icon, shortcut: item.shortcut, danger: item.danger, disabled: item.disabled,
      value: actions.push(item.onSelect ?? (() => {})) - 1,
    })
    setMenu({ entries, actions })
    menuPoint.current = { x, y }
    return true
  }
  // Once the items have rendered, open it at the point.
  useEffect(() => {
    const point = menuPoint.current
    if (!point || !menuAnchor.current) return
    menuPoint.current = null
    menuAnchor.current.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: point.x, clientY: point.y }))
  })

  // ---- Availability: true, or the reason it isn't (false gives the default).
  const reasonFor = (query: CalendarQuery<E>): string | null => {
    const answer = isAvailable?.(query) ?? true
    return answer === true ? null : answer === false ? t.unavailable : answer
  }
  const timed = (column: Column<R>, from: number, to: number, event?: E): CalendarQuery<E> => ({
    start: toISODateTime(addMinutes(column.date, from)), end: toISODateTime(addMinutes(column.date, to)), allDay: false,
    ...(column.resource && { resourceId: column.resource.id }), ...(event && { event }),
  })
  // A column's unavailable time, slot by slot, merged into runs with one reason.
  const unavailableRuns = (column: Column<R>) => {
    if (!isAvailable) return []
    const runs: { from: number, to: number, reason: string }[] = []
    for (let from = startHour * 60; from < endHour * 60; from += slotMinutes) {
      const reason = reasonFor({ ...timed(column, from, from + slotMinutes), shading: true })
      const last = runs[runs.length - 1]
      if (!reason) continue
      if (last && last.to === from && last.reason === reason) last.to = from + slotMinutes
      else runs.push({ from, to: from + slotMinutes, reason })
    }
    return runs
  }
  const refuse = (reason: string, attempt: CalendarQuery<E>) => {
    setStatus(reason)
    onUnavailable?.(reason, attempt)
  }

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

  // Where an event would go if moved by `byColumns` and `byMinutes` (or resized by `byMinutes`).
  function target(event: E, kind: 'move' | 'resize', byColumns: number, byMinutes: number) {
    const start = parse(event.start)
    const end = parse(event.end)
    const from = columnOf(event, event.start.slice(0, 10))
    if (from < 0) return null
    if (kind === 'resize') {
      const newEnd = addMinutes(end, byMinutes)
      if (minutesBetween(start, newEnd) < slotMinutes) return null
      return { start, end: newEnd, column: columns[from] }
    }
    const column = columns[Math.max(0, Math.min(columns.length - 1, from + byColumns))]
    const days = Math.round((column.date.getTime() - columns[from].date.getTime()) / 86400000)
    return { start: addMinutes(addDays(start, days), byMinutes), end: addMinutes(addDays(end, days), byMinutes), column }
  }

  const queryFor = (event: E, next: { start: Date, end: Date, column: Column<R> }): CalendarQuery<E> => ({
    start: toISODateTime(next.start), end: toISODateTime(next.end), allDay: false, event,
    ...(next.column.resource && { resourceId: next.column.resource.id }),
  })

  // Applies a change (after checking it's allowed).
  function commit(event: E, kind: 'move' | 'resize', next: { start: Date, end: Date, column: Column<R> }) {
    const query = queryFor(event, next)
    const reason = reasonFor(query)
    if (reason) return refuse(reason, query)
    refocus.current = event.id
    setStatus(kind === 'resize'
      ? t.resized(nameOf(event), timeFormat.format(next.end))
      : t.moved(nameOf(event), `${longDay.format(next.start)}, ${timeFormat.format(next.start)}${resourceName(next.column)}`))
    onEventChange?.(event, {
      start: query.start, end: query.end, ...(next.column.resource && { resourceId: next.column.resource.id }),
    }, { kind })
  }

  function change(event: E, kind: 'move' | 'resize', byColumns: number, byMinutes: number) {
    const next = target(event, kind, byColumns, byMinutes)
    if (next) commit(event, kind, next)
  }

  const keysOf = (e: PointerEvent) => ({ shiftKey: e.shiftKey, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey })
  const minuteAt = (y: number, box: { top: number, height: number }) =>
    startHour * 60 + snap(Math.max(0, Math.min(span - 1, ((y - box.top) / box.height) * span)))

  function begin(e: PointerEvent<HTMLElement>, kind: Gesture<E>['kind'], column: number, event?: E) {
    if (e.button !== 0) return
    e.stopPropagation()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* not a live pointer */ }
    if (kind === 'all-day') {
      // The strip spans every column: which one is under the pointer.
      const box = e.currentTarget.getBoundingClientRect()
      const width = box.width / columns.length
      const at = Math.max(0, Math.min(columns.length - 1, Math.floor((e.clientX - box.left) / width)))
      gesture.current = { kind, column: at, x: e.clientX, y: e.clientY, top: box.top, height: box.height, width, left: box.left, from: at, moved: false, keys: keysOf(e) }
      setPreview({ kind: 'all-day', columns: [at] })
      return
    }
    const box = e.currentTarget.closest('[data-part=day]')!.getBoundingClientRect()
    const from = minuteAt(e.clientY, box)
    gesture.current = { kind, column, x: e.clientX, y: e.clientY, top: box.top, height: box.height, width: box.width, left: box.left, from, moved: false, keys: keysOf(e), event }
    if (kind === 'select') setPreview({ kind: 'select', column, from, to: from + slotMinutes })
    if (kind === 'place') setPreview({ kind: 'place', column, from })
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
      const at = minuteAt(e.clientY, g)
      setPreview({ kind: 'select', column: g.column, from: Math.min(g.from, at), to: Math.max(g.from, at) + slotMinutes })
    } else if (g.kind === 'place') {
      setPreview({ kind: 'place', column: g.column, from: minuteAt(e.clientY, g) })
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
      const query = timed(column, p.from, p.to)
      const reason = reasonFor(query)
      if (reason) return refuse(reason, query)
      setStatus(t.selected(`${longDay.format(addMinutes(column.date, p.from))}, ${timeFormat.format(addMinutes(column.date, p.from))} – ${timeFormat.format(addMinutes(column.date, p.to))}${resourceName(column)}`))
      onSelect?.({ start: query.start, end: query.end, allDay: false, ...(column.resource && { resourceId: column.resource.id }) }, g.keys)
      return
    }
    if (g.kind === 'all-day' && p?.kind === 'all-day') {
      const firstColumn = columns[p.columns[0]]
      const lastColumn = columns[p.columns[p.columns.length - 1]]
      const query: CalendarQuery<E> = { start: firstColumn.iso, end: lastColumn.iso, allDay: true, ...(firstColumn.resource && { resourceId: firstColumn.resource.id }) }
      const reason = reasonFor(query)
      if (reason) return refuse(reason, query)
      setStatus(t.selected(`${longDay.format(firstColumn.date)}${p.columns.length > 1 ? ` – ${longDay.format(lastColumn.date)}` : ''}, ${t.allDay.toLowerCase()}${resourceName(firstColumn)}`))
      onSelect?.({ start: query.start, end: query.end, allDay: true, ...(firstColumn.resource && { resourceId: firstColumn.resource.id }) }, g.keys)
      return
    }
    if (g.kind === 'place' && p?.kind === 'place' && pinned) {
      const duration = minutesBetween(parse(pinned.start), parse(pinned.end)) || slotMinutes
      const column = columns[p.column]
      commit(pinned, 'move', { start: addMinutes(column.date, p.from), end: addMinutes(column.date, p.from + duration), column })
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
    if (!editable(event)) return
    const keys: Record<string, [number, number]> = { ArrowUp: [0, -slotMinutes], ArrowDown: [0, slotMinutes], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
    const move = keys[e.key]
    if (!move) return
    e.preventDefault()
    if (e.shiftKey && move[0] === 0) change(event, 'resize', 0, move[1])
    else change(event, 'move', move[0], move[1])
  }

  // Placing a pinned event: the slot under the pointer previews it; Escape stops.
  function hover(e: PointerEvent<HTMLElement>, column: number) {
    if (!pinned || gesture.current) return
    const box = e.currentTarget.closest('[data-part=day]')!.getBoundingClientRect()
    setPreview({ kind: 'place', column, from: minuteAt(e.clientY, box) })
  }
  useEffect(() => {
    if (!pinned) return
    const escape = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onPinnedChange?.(null) }
    addEventListener('keydown', escape)
    return () => removeEventListener('keydown', escape)
  }, [pinned, onPinnedChange])

  // A moved event lands in another column (a new element): focus it again.
  useEffect(() => {
    if (refocus.current == null) return
    grid.current?.querySelector<HTMLElement>(`[data-event-id="${CSS.escape(String(refocus.current))}"]`)?.focus()
    refocus.current = null
  })

  // ---- Scrolling inside `height`: the header rows stick, each below the last.
  useLayoutEffect(() => {
    const el = grid.current
    if (!el || !height) return
    let offset = 0
    const rowsSeen = new Set<string>()
    for (const cell of el.querySelectorAll<HTMLElement>('[data-sticky-row]')) {
      const row = cell.dataset.stickyRow!
      if (!rowsSeen.has(row)) {
        rowsSeen.add(row)
        el.style.setProperty(`--sticky-${row}`, `${offset}px`)
        offset += cell.getBoundingClientRect().height
      }
    }
    el.style.setProperty('--sticky-total', `${offset}px`)
  })
  // Opens scrolled to `scrollToTime` ('now' when today's shown), once.
  const scrolled = useRef(false)
  useLayoutEffect(() => {
    const el = grid.current
    if (!el || !height || !scrollToTime || scrolled.current) return
    scrolled.current = true
    const day = el.querySelector<HTMLElement>('[data-part=day]')
    if (!day) return
    const [h, m] = scrollToTime === 'now' ? [now.getHours() - 1, 0] : scrollToTime.split(':').map(Number)
    const minutes = Math.max(startHour * 60, Math.min(endHour * 60, h * 60 + (m || 0)))
    const sticky = parseFloat(el.style.getPropertyValue('--sticky-total')) || 0
    el.scrollTop = day.offsetTop + ((minutes - startHour * 60) / span) * day.offsetHeight - sticky
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
    return runs.map((run) => ({ event, first: run[0], length: run.length, lane: 0, continued: false }))
  })
  allDay.sort((a, b) => a.first - b.first || b.length - a.length)
  const laneEnds: number[] = []
  for (const bar of allDay) {
    let lane = laneEnds.findIndex((endAt) => endAt < bar.first)
    if (lane < 0) lane = laneEnds.length
    laneEnds[lane] = bar.first + bar.length - 1
    bar.lane = lane
  }
  // Past `allDayMax` lanes, the rest fold into a "+2 more" per column (until opened).
  const folding = laneEnds.length > allDayMax && !allDayOpen
  const shownLanes = folding ? allDayMax - 1 : laneEnds.length
  // Folded bars still show in the columns where a shown lane is free there
  // (a bar starting under two full lanes can show on its later, emptier days):
  // they're cut into pieces, each in the lowest lane free along it.
  type Bar = (typeof allDay)[number]
  const shownBars: Bar[] = allDay.filter((bar) => bar.lane < shownLanes)
  const hiddenCount = columns.map(() => 0)
  if (folding) {
    const taken = columns.map((_, i) => new Set(shownBars.filter((bar) => i >= bar.first && i < bar.first + bar.length).map((bar) => bar.lane)))
    for (const bar of allDay.filter((b) => b.lane >= shownLanes)) {
      let piece: Bar | null = null
      for (let i = bar.first; i < bar.first + bar.length; i++) {
        const lane = Array.from({ length: shownLanes }, (_, l) => l).find((l) => !taken[i].has(l))
        if (lane === undefined) { hiddenCount[i]++; piece = null; continue }
        if (piece && piece.lane === lane && piece.first + piece.length === i) piece.length++
        // A piece after the bar's start continues it (drawn with a square left end).
        else shownBars.push(piece = { ...bar, first: i, length: 1, lane, continued: i > bar.first })
        taken[i].add(lane)
      }
    }
  }
  const hiddenIn = (i: number) => hiddenCount[i]

  const twoRows = !!resources?.length && count > 1
  const editable = (event: E) => !!onEventChange && event.editable !== false && !event.pending
  const pinnedMinutes = pinned ? minutesBetween(parse(pinned.start), parse(pinned.end)) || slotMinutes : 0
  // The header rows, numbered for sticking: days, resources, extra rows, the all-day strip.
  let rowNumber = 0
  const dayRow = !resources?.length || count > 1 ? rowNumber++ : -1
  const resourceRow = resources?.length ? rowNumber++ : -1
  const extraRows = rows.map(() => rowNumber++)
  const allDayRow = rowNumber

  // The preview's problem, if any, shown as it's dragged.
  const previewReason = (() => {
    if (!preview || !isAvailable) return null
    if (preview.kind === 'select') return reasonFor(timed(columns[preview.column], preview.from, preview.to))
    if (preview.kind === 'place') return pinned ? reasonFor(timed(columns[preview.column], preview.from, preview.from + pinnedMinutes, pinned)) : null
    if (preview.kind === 'all-day') {
      const a = columns[preview.columns[0]]
      const b = columns[preview.columns[preview.columns.length - 1]]
      return reasonFor({ start: a.iso, end: b.iso, allDay: true, ...(a.resource && { resourceId: a.resource.id }) })
    }
    const event = events.find((e) => e.id === preview.id)
    const next = event && (preview.kind === 'move' ? target(event, 'move', preview.columns, preview.minutes) : target(event, 'resize', 0, preview.minutes))
    return next && event ? reasonFor(queryFor(event, next)) : null
  })()

  return (
    <div {...rest} {...part('root')} ref={root} className={cx(className, classes?.root)} data-placing={pinned ? '' : undefined}
      style={{ ...style, '--columns': columns.length, '--hour-height': hourHeight } as CSSProperties}>
      {toolbar && (
        <div {...part('toolbar')}>
          <div {...part('nav')}>
            <Button size="sm" onClick={() => setDate(today)}>{t.today}</Button>
            <Button size="sm" variant="ghost" icon="lucide:chevron-left" aria-label={t.previous} onClick={() => setDate(toISODate(addDays(current, -step)))} />
            <Button size="sm" variant="ghost" icon="lucide:chevron-right" aria-label={t.next} onClick={() => setDate(toISODate(addDays(current, step)))} />
          </div>
          {/* The title opens a month, to jump to any date. */}
          <Popover placement="bottom-start" open={picking} onOpenChange={setPicking} trigger={
            <button type="button" {...part('title')} aria-label={`${title}: ${t.pickDate}`}>
              {title}<iconify-icon icon="lucide:chevron-down" aria-hidden="true" />
            </button>
          }>
            <DatePicker inline value={date} locale={locale} onValueChange={(value) => { if (value) { setDate(value); setPicking(false) } }} />
          </Popover>
          <div {...part('actions')}>
            {!narrow && views.length > 1 && (
              <Segmented size="sm" aria-label={t.view} items={views.map((v) => ({ value: String(v), label: viewLabel(v) }))}
                value={String(chosenView)} onValueChange={(v) => v && setView(/^\d+$/.test(v) ? Number(v) : v as CalendarView)} />
            )}
            {actions}
          </div>
        </div>
      )}

      {pinned && (
        <div {...part('pinned')} role="status">
          <iconify-icon icon="lucide:move" aria-hidden="true" />
          <span>{t.placing(nameOf(pinned))}</span>
          <Button size="sm" variant="ghost" onClick={() => onPinnedChange?.(null)}>{t.cancel}</Button>
        </div>
      )}

      <div {...part('grid')} ref={grid} role="grid" aria-label={title} data-two-rows={twoRows || undefined}
        data-scroll={height ? '' : undefined} style={height ? { maxHeight: height } : undefined}>
        {/* Headers: the days (spanning their resources), then the resources. */}
        <div {...part('corner')} data-sticky-row={dayRow >= 0 ? dayRow : resourceRow}
          style={{ gridRow: twoRows ? 'span 2' : undefined, top: `var(--sticky-${dayRow >= 0 ? dayRow : resourceRow})` }} />
        {dayRow >= 0 && dates.map((d) => (
          <div key={toISODate(d)} {...part('day-header')} role="columnheader" data-today={sameDay(d, now) || undefined}
            data-sticky-row={dayRow} style={{ gridColumn: `span ${lanes.length}`, top: `var(--sticky-${dayRow})` }}>
            {(() => {
              const content = renderDayHeader ? renderDayHeader(d) : <><span>{dayFormat.format(d)}</span><strong>{d.getDate()}</strong></>
              return onDayClick
                ? <button type="button" {...part('header-button')} onClick={() => onDayClick(toISODate(d))} aria-label={longDay.format(d)}>{content}</button>
                : content
            })()}
          </div>
        ))}
        {resourceRow >= 0 && columns.map((c) => (
          <div key={`${c.iso}-${c.resource!.id}`} {...part('resource-header')} role="columnheader"
            data-sticky-row={resourceRow} style={{ top: `var(--sticky-${resourceRow})` }}>
            {onResourceClick
              ? <button type="button" {...part('header-button')} onClick={() => onResourceClick(c.resource!, c.iso)}>
                  {renderResource ? renderResource(c.resource!) : c.resource!.title}
                </button>
              : renderResource ? renderResource(c.resource!) : c.resource!.title}
          </div>
        ))}

        {rows.map((row, r) => <Fragment key={row.key}>
          <div {...part('row-label')} data-sticky-row={extraRows[r]} style={{ top: `var(--sticky-${extraRows[r]})` }}>{row.label}</div>
          {(row.perColumn ? columns : dates.map((d) => ({ date: d, iso: toISODate(d), resource: null }))).map((cell) => {
            const content = row.render?.(cell.date, cell.resource as R | null)
            const key = `${cell.iso}-${cell.resource?.id ?? ''}`
            const cellStyle = { gridColumn: row.perColumn ? undefined : `span ${lanes.length}`, top: `var(--sticky-${extraRows[r]})` }
            return row.onClick
              // The whole cell adds (say, a message); what's in it opens its own (stopPropagation in your render).
              ? <div key={key} {...part('row-cell')} style={cellStyle} data-sticky-row={extraRows[r]} data-clickable="" role="button" tabIndex={0}
                  aria-label={`${typeof row.label === 'string' ? row.label : ''} ${longDay.format(cell.date)}`}
                  onClick={() => row.onClick!(cell.date, cell.resource as R | null)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.onClick!(cell.date, cell.resource as R | null) } }}>{content}</div>
              : <div key={key} {...part('row-cell')} style={cellStyle} data-sticky-row={extraRows[r]}>{content}</div>
          })}
        </Fragment>)}

        {(allDay.length > 0 || onSelect) && <>
          {/* The label opens and closes a folded strip. */}
          <div {...part('all-day-label')} data-sticky-row={allDayRow} style={{ top: `var(--sticky-${allDayRow})` }}>
            {laneEnds.length > allDayMax
              ? <button type="button" onClick={() => setAllDayOpen(!allDayOpen)} aria-expanded={allDayOpen}>
                  {t.allDay}<iconify-icon icon={allDayOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'} aria-hidden="true" />
                </button>
              : t.allDay}
          </div>
          <div {...part('all-day')} data-sticky-row={allDayRow}
            style={{ '--lanes': Math.max(1, shownLanes + (folding ? 1 : 0)), top: `var(--sticky-${allDayRow})` } as CSSProperties}
            data-selectable={onSelect ? '' : undefined}
            onPointerDown={(e) => { if (onSelect && e.target === e.currentTarget) begin(e, 'all-day', 0) }}
            onPointerMove={track} onPointerUp={end} onPointerCancel={cancel}
            onContextMenu={(e) => {
              if (e.target !== e.currentTarget) return
              const box = e.currentTarget.getBoundingClientRect()
              const column = columns[Math.max(0, Math.min(columns.length - 1, Math.floor((e.clientX - box.left) / (box.width / columns.length))))]
              const slot = { start: column.iso, end: column.iso, allDay: true, ...(column.resource && { resourceId: column.resource.id }) }
              if (openMenu(e.clientX, e.clientY, slotMenu?.(slot))) e.preventDefault()
            }}>
            {preview?.kind === 'all-day' && preview.columns.map((i) => (
              <div key={i} {...part('selection')} data-all-day="" data-invalid={previewReason ? '' : undefined}
                style={{ left: `${(i / columns.length) * 100}%`, width: `${100 / columns.length}%` }} />
            ))}
            {shownBars.map(({ event, first, length: covers, lane, continued }) => (
              <button key={`${event.id}-${first}`} type="button" {...part('all-day-event')} data-continued={continued || undefined}
                data-color={named.includes(event.color ?? 'accent') ? event.color ?? 'accent' : 'custom'} data-blocked={event.blocked || undefined}
                style={{
                  left: `${(first / columns.length) * 100}%`, width: `${(covers / columns.length) * 100}%`, top: `calc(${lane} * 1.625rem + 0.25rem)`,
                  ...(event.color && !named.includes(event.color) && { '--event-color': event.color }),
                } as CSSProperties}
                onClick={() => onEventClick?.(event)}
                onContextMenu={(e) => { if (openMenu(e.clientX, e.clientY, eventMenu?.(event))) e.preventDefault() }}>
                {renderEvent ? renderEvent(event, { start: parse(event.start), end: parse(event.end), resource: null, compact: true }) : event.title}
              </button>
            ))}
            {folding && columns.map((_, i) => hiddenIn(i) > 0 && (
              <button key={`more-${i}`} type="button" {...part('more')} onClick={() => setAllDayOpen(true)}
                style={{ left: `${(i / columns.length) * 100}%`, width: `${100 / columns.length}%`, top: `calc(${shownLanes} * 1.625rem + 0.25rem)` }}>
                {t.more(hiddenIn(i))}
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
          const placing = preview?.kind === 'place' && preview.column === index ? preview : null
          const isToday = sameDay(column.date, now)
          // A press on the column (or its unavailable shading): select, or place the pinned event.
          const press = (e: PointerEvent<HTMLElement>) => {
            if (pinned) begin(e, 'place', index)
            else if (onSelect) begin(e, 'select', index)
          }
          return (
            <div key={`${column.iso}-${column.resource?.id ?? ''}`} {...part('day')} role="gridcell"
              aria-label={`${longDay.format(column.date)}${resourceName(column)}`}
              data-today={isToday || undefined} data-selectable={onSelect || pinned ? '' : undefined}
              data-first={(!!resources?.length && column.resource === lanes[0]) || undefined}
              style={{ '--hours': hours.length } as CSSProperties}
              onPointerDown={(e) => { if (e.target === e.currentTarget) press(e) }}
              onPointerMove={(e) => { track(e); hover(e, index) }} onPointerUp={end} onPointerCancel={cancel}
              onPointerLeave={() => { if (pinned && !gesture.current) setPreview(null) }}
              onContextMenu={(e) => {
                // An empty time (or its unavailable shading), not an event.
                if (e.target !== e.currentTarget && (e.target as HTMLElement).dataset.part !== 'unavailable') return
                const from = minuteAt(e.clientY, e.currentTarget.getBoundingClientRect())
                const { event: _none, ...slot } = timed(column, from, from + slotMinutes)
                if (openMenu(e.clientX, e.clientY, slotMenu?.(slot))) e.preventDefault()
              }}>
              {unavailableRuns(column).map((run) => (
                <div key={run.from} {...part('unavailable')} title={run.reason}
                  style={{ top: top(run.from), height: length(run.to - run.from) }} onPointerDown={press} />
              ))}
              {place(own).map(({ event, start, end: finish, column: sub, columns: subs }) => {
                const moving = preview?.kind === 'move' && preview.id === event.id ? preview : null
                const resizing = preview?.kind === 'resize' && preview.id === event.id ? preview : null
                const shownEnd = resizing ? addMinutes(finish, resizing.minutes) : finish
                const minutes = minutesBetween(start, shownEnd)
                const color = event.color ?? 'accent'
                const time = `${timeFormat.format(start)} – ${timeFormat.format(shownEnd)}`
                const box = { top: top(minutesOfDay(start)), left: `${(sub / subs) * 100}%`, width: `${100 / subs}%` }
                return (
                  <Fragment key={event.id}>
                    {/* Where it was, while it's dragged. */}
                    {(moving || resizing) && <div {...part('ghost')} style={{ ...box, height: length(minutesBetween(start, finish)) }} />}
                    <button type="button" {...part('event')} data-event-id={event.id}
                      data-dragging={moving || resizing ? '' : undefined} data-invalid={(moving || resizing) && previewReason ? '' : undefined}
                      data-editable={editable(event) || undefined} data-compact={minutes <= 30 || undefined}
                      data-blocked={event.blocked || undefined} data-pending={event.pending || undefined} data-pinned={pinned?.id === event.id || undefined}
                      data-color={named.includes(color) ? color : 'custom'}
                      aria-label={`${nameOf(event)}, ${time}`} aria-busy={event.pending || undefined}
                      title={(moving || resizing) && previewReason ? previewReason : undefined}
                      style={{
                        ...box, height: length(Math.max(slotMinutes, minutes)),
                        ...(!named.includes(color) && { '--event-color': color }),
                        ...(moving && { transform: `translate(${moving.x}px, ${moving.y}px)` }),
                      } as CSSProperties}
                      onPointerDown={(e) => { if (editable(event) && !pinned) begin(e, 'move', index, event); else e.stopPropagation() }}
                      onPointerMove={track} onPointerUp={end} onPointerCancel={cancel}
                      onKeyDown={(e) => {
                        if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
                          const box = e.currentTarget.getBoundingClientRect()
                          if (openMenu(box.left + 8, box.bottom, eventMenu?.(event))) e.preventDefault()
                        } else keyDown(e, event)
                      }}
                      onContextMenu={(e) => { if (openMenu(e.clientX, e.clientY, eventMenu?.(event))) e.preventDefault() }}
                      onClick={() => { if (suppressClick.current) suppressClick.current = false; else onEventClick?.(event) }}>
                      {renderEvent ? renderEvent(event, { start, end: shownEnd, resource: column.resource, compact: minutes <= 30 }) : <>
                        <span {...part('event-title')}>{event.title}</span>
                        <span {...part('event-time')}>{time}</span>
                      </>}
                      {editable(event) && !pinned && (
                        <span {...part('resize')} aria-hidden="true"
                          onPointerDown={(e) => begin(e, 'resize', index, event)} onPointerMove={track} onPointerUp={end} onPointerCancel={cancel} />
                      )}
                    </button>
                  </Fragment>
                )
              })}
              {selecting && (
                <div {...part('selection')} data-invalid={previewReason ? '' : undefined}
                  style={{ top: top(selecting.from), height: length(selecting.to - selecting.from) }}>
                  {previewReason ?? `${timeFormat.format(addMinutes(column.date, selecting.from))} – ${timeFormat.format(addMinutes(column.date, selecting.to))}`}
                </div>
              )}
              {placing && pinned && (
                <div {...part('selection')} data-placing="" data-invalid={previewReason ? '' : undefined}
                  style={{ top: top(placing.from), height: length(pinnedMinutes) }}>
                  {previewReason ?? `${nameOf(pinned)}, ${timeFormat.format(addMinutes(column.date, placing.from))}`}
                </div>
              )}
              {isToday && minutesOfDay(now) >= startHour * 60 && minutesOfDay(now) < endHour * 60 && (
                <div {...part('now')} style={{ top: top(minutesOfDay(now)) }} aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>
      <Menu context trigger={<span ref={menuAnchor} aria-hidden="true" style={menuAnchorStyle} />}
        items={menu.entries} onSelect={(value) => menu.actions[value as number]?.()} />
      <div {...part('status')} aria-live="polite" role="status">{status}</div>
    </div>
  )
}
