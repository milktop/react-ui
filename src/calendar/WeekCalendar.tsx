/**
 * A week of events by the hour, e.g. a tutor's lessons: days across, hours
 * down, events placed by their times (side by side where they overlap), and
 * a line at the current time.
 *
 *   <WeekCalendar events={lessons} onEventClick={open} onSlotClick={book} onEventMove={reschedule} />
 *
 * Times are local ISO strings ('2025-10-09T16:00'), as DatePicker's dates are.
 *
 * - `events`: `{ id, title, start, end, description, color }`; `color` is
 *   'accent' (default), 'success', 'warning', 'danger', 'neutral' or any CSS colour
 * - `week`, `defaultWeek`: a date in the week shown (today's by default);
 *   `onWeekChange`: called with the new week's first day, from the toolbar
 * - `days`: 7 (default) or 5 (weekdays); `weekStartsOn`: 1 (Monday) or 0 (Sunday)
 * - `startHour`, `endHour`: the hours shown (7 to 21)
 * - `slotMinutes`: what clicks and moves snap to (30)
 * - `onEventClick(event)`; `onSlotClick({ start, end })`: an empty slot was
 *   clicked (to book it)
 * - `onEventMove(event, { start, end })`: makes events movable: drag one to
 *   another day or time, or focus it and use the arrow keys (↑↓ by a slot,
 *   ←→ by a day). Update your events in response
 * - `renderEvent(event)`: an event's content (its title and time by default)
 * - `actions`: beside the toolbar's week; `toolbar`: false hides it
 * - `locale`: for the day and time labels (the browser's by default)
 */
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import 'iconify-icon'
import { Button } from '../button/Button.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { addDays, addMinutes, minutesOfDay, parse, sameDay, startOfWeek, toISODate, toISODateTime } from './dates.js'
import '../theme.css'
import './calendar.css'

export type CalendarEvent = {
  id: string | number
  title: ReactNode
  start: string
  end: string
  description?: ReactNode
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | (string & {})
}
export type CalendarSlot = { start: string, end: string }

export type WeekCalendarProps<E extends CalendarEvent = CalendarEvent> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  events?: E[]
  week?: string
  defaultWeek?: string
  onWeekChange?: (week: string) => void
  days?: 5 | 7
  weekStartsOn?: 0 | 1
  startHour?: number
  endHour?: number
  slotMinutes?: number
  onEventClick?: (event: E) => void
  onSlotClick?: (slot: CalendarSlot) => void
  onEventMove?: (event: E, to: CalendarSlot) => void
  renderEvent?: (event: E) => ReactNode
  actions?: ReactNode
  toolbar?: boolean
  locale?: string
  classes?: Classes<'root' | 'toolbar' | 'title' | 'nav' | 'grid' | 'corner' | 'dayHeader' | 'gutter' | 'hour' | 'day' | 'event' | 'eventTitle' | 'eventTime' | 'now'>
}

const named = ['accent', 'success', 'warning', 'danger', 'neutral']

type Placed<E> = { event: E, start: Date, end: Date, column: number, columns: number }

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

export function WeekCalendar<E extends CalendarEvent = CalendarEvent>({
  events = [], week: weekProp, defaultWeek, onWeekChange, days = 7, weekStartsOn = 1, startHour = 7, endHour = 21,
  slotMinutes = 30, onEventClick, onSlotClick, onEventMove, renderEvent, actions = null, toolbar = true, locale,
  className, classes, style, ...rest
}: WeekCalendarProps<E>) {
  const part = partsOf('calendar', classes)
  const [today] = useState(() => toISODate(new Date()))
  const [week, setWeek] = useControllable(weekProp, defaultWeek ?? today, onWeekChange)
  const first = startOfWeek(parse(week), weekStartsOn)
  const dates = Array.from({ length: days }, (_, i) => addDays(first, i))
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const span = (endHour - startHour) * 60

  // The time now, for the line across today; moved on each minute.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const dayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const hourFormat = new Intl.DateTimeFormat(locale, { hour: 'numeric' })
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' })
  const rangeFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  const title = rangeFormat.formatRange(dates[0], dates[dates.length - 1])

  const go = (weeks: number) => setWeek(toISODate(addDays(first, weeks * 7)))
  const top = (minutes: number) => `${((minutes - startHour * 60) / span) * 100}%`

  // Moving: a drag shown as an offset (days across, minutes down) until it's dropped.
  const grid = useRef<HTMLDivElement>(null)
  // `x` and `y`: the offset on screen, snapped to whole days and slots.
  const [drag, setDrag] = useState<{ id: E['id'], days: number, minutes: number, x: number, y: number } | null>(null)
  const pointer = useRef<{ id: E['id'], x: number, y: number, moved: boolean } | null>(null)
  const refocus = useRef<E['id'] | null>(null)

  function measure() {
    const column = grid.current?.querySelector('[data-part=day]')
    const box = column?.getBoundingClientRect()
    return { width: box?.width ?? 1, perMinute: (box?.height ?? 1) / span }
  }

  function moveTo(event: E, byDays: number, byMinutes: number) {
    const start = addMinutes(addDays(parse(event.start), byDays), byMinutes)
    const end = addMinutes(addDays(parse(event.end), byDays), byMinutes)
    refocus.current = event.id
    onEventMove?.(event, { start: toISODateTime(start), end: toISODateTime(end) })
  }

  function pointerDown(e: PointerEvent, event: E) {
    if (!onEventMove || e.button !== 0) return
    // Keeps the moves coming when the pointer leaves the event.
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* not a live pointer */ }
    pointer.current = { id: event.id, x: e.clientX, y: e.clientY, moved: false }
  }

  function pointerMove(e: PointerEvent) {
    const p = pointer.current
    if (!p) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    if (!p.moved && Math.hypot(dx, dy) < 4) return
    p.moved = true
    const { width, perMinute } = measure()
    const byDays = Math.round(dx / width)
    const byMinutes = Math.round(dy / perMinute / slotMinutes) * slotMinutes
    setDrag({ id: p.id, days: byDays, minutes: byMinutes, x: byDays * width, y: byMinutes * perMinute })
  }

  function pointerUp(event: E) {
    const p = pointer.current
    pointer.current = null
    if (!p?.moved) return
    // The click that follows a drag isn't a click on the event.
    suppressClick.current = true
    if (drag && (drag.days || drag.minutes)) moveTo(event, drag.days, drag.minutes)
    setDrag(null)
  }
  const suppressClick = useRef(false)

  function keyDown(e: KeyboardEvent, event: E) {
    if (!onEventMove) return
    const step = { ArrowUp: [0, -slotMinutes], ArrowDown: [0, slotMinutes], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key]
    if (!step) return
    e.preventDefault()
    moveTo(event, step[0], step[1])
  }

  // A moved event lands in another column (a new element): focus it again.
  useEffect(() => {
    if (refocus.current == null) return
    grid.current?.querySelector<HTMLElement>(`[data-event-id="${CSS.escape(String(refocus.current))}"]`)?.focus()
    refocus.current = null
  })

  function slotClick(e: MouseEvent<HTMLDivElement>, date: Date) {
    if (!onSlotClick || e.target !== e.currentTarget) return
    const box = e.currentTarget.getBoundingClientRect()
    const minutes = startHour * 60 + Math.floor(((e.clientY - box.top) / box.height) * span / slotMinutes) * slotMinutes
    const start = addMinutes(date, minutes)
    onSlotClick({ start: toISODateTime(start), end: toISODateTime(addMinutes(start, slotMinutes)) })
  }

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)}
      style={{ ...style, '--days': days } as CSSProperties} data-movable={onEventMove ? '' : undefined}>
      {toolbar && (
        <div {...part('toolbar')}>
          <div {...part('nav')}>
            <Button size="sm" onClick={() => setWeek(today)}>Today</Button>
            <Button size="sm" variant="ghost" icon="lucide:chevron-left" aria-label="Previous week" onClick={() => go(-1)} />
            <Button size="sm" variant="ghost" icon="lucide:chevron-right" aria-label="Next week" onClick={() => go(1)} />
          </div>
          <h2 {...part('title')} aria-live="polite">{title}</h2>
          {actions}
        </div>
      )}
      <div {...part('grid')} ref={grid} role="grid" aria-label={title}>
        <div {...part('corner')} />
        {dates.map((date) => (
          <div key={toISODate(date)} {...part('day-header')} role="columnheader" data-today={sameDay(date, now) || undefined}>
            <span>{dayFormat.format(date)}</span><strong>{date.getDate()}</strong>
          </div>
        ))}
        <div {...part('gutter')} aria-hidden="true" style={{ '--hours': hours.length } as CSSProperties}>
          {hours.map((hour) => <span key={hour} {...part('hour')} style={{ top: top(hour * 60) }}>{hourFormat.format(new Date(2000, 0, 1, hour))}</span>)}
        </div>
        {dates.map((date) => {
          const iso = toISODate(date)
          const placed = place(events.filter((event) => event.start.startsWith(iso)))
          return (
            <div key={iso} {...part('day')} role="gridcell" aria-label={new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date)}
              data-today={sameDay(date, now) || undefined} data-clickable={onSlotClick ? '' : undefined}
              style={{ '--hours': hours.length } as CSSProperties} onClick={(e) => slotClick(e, date)}>
              {placed.map(({ event, start, end, column, columns }) => {
                const dragging = drag?.id === event.id
                const color = event.color ?? 'accent'
                const time = `${timeFormat.format(start)} – ${timeFormat.format(end)}`
                return (
                  <button key={event.id} type="button" {...part('event')} data-event-id={event.id} data-dragging={dragging || undefined}
                    data-color={named.includes(color) ? color : 'custom'} aria-label={`${typeof event.title === 'string' ? event.title : ''}, ${time}`}
                    style={{
                      top: top(minutesOfDay(start)), height: `${((end.getTime() - start.getTime()) / 60000 / span) * 100}%`,
                      left: `${(column / columns) * 100}%`, width: `${100 / columns}%`,
                      ...(!named.includes(color) && { '--event-color': color }),
                      ...(dragging && { transform: `translate(${drag.x}px, ${drag.y}px)` }),
                    } as CSSProperties}
                    onPointerDown={(e) => pointerDown(e, event)} onPointerMove={pointerMove} onPointerUp={() => pointerUp(event)}
                    onPointerCancel={() => { pointer.current = null; setDrag(null) }}
                    onKeyDown={(e) => keyDown(e, event)}
                    onClick={() => { if (suppressClick.current) suppressClick.current = false; else onEventClick?.(event) }}>
                    {renderEvent ? renderEvent(event) : <>
                      <span {...part('event-title')}>{event.title}</span>
                      <span {...part('event-time')}>{time}</span>
                    </>}
                  </button>
                )
              })}
              {sameDay(date, now) && minutesOfDay(now) >= startHour * 60 && minutesOfDay(now) < endHour * 60 && (
                <div {...part('now')} style={{ top: top(minutesOfDay(now)) }} aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
