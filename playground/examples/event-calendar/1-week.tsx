/* A tutor's week
  Drag down an empty part of a day to select a time (or click one slot) and book it; drag along the all-day strip (or click a day there) to add an all-day event. Drag a lesson to move it, or its bottom edge to change its length; or focus it and use the arrow keys (Shift+↑↓ for its length). Click the title to jump to a date, or a day's header to open that day (`onDayClick`); switch views on the right. `onRangeChange` reports the days shown, to load them. All-day events (half term, mock exams) sit along the top. */
import { useState } from 'react'
import { EventCalendar, confirm, toaster, type CalendarChange, type CalendarSelection, type CalendarView } from '@milktop/react-ui'
import { lessons as initial, type Lesson } from './lessons'

const time = (iso: string) => iso.slice(11)

export default function Example() {
  const [lessons, setLessons] = useState(initial)
  // Controlled, so a click on a day's header can open that day.
  const [view, setView] = useState<CalendarView>('week')
  const [date, setDate] = useState(() => new Date().toLocaleDateString('sv'))  // today, as YYYY-MM-DD (local)
  const [range, setRange] = useState('')

  // A time: a lesson. Days in the all-day strip: an all-day event (a holiday, an exam day).
  async function book({ start, end, allDay }: CalendarSelection) {
    const when = allDay ? (start === end ? start : `${start} to ${end}`) : `${start.slice(0, 10)}, ${time(start)} to ${time(end)}`
    if (!await confirm({ heading: allDay ? 'Add an all-day event?' : 'Book a lesson?', description: when, confirmLabel: allDay ? 'Add' : 'Book' })) return
    setLessons([...lessons, allDay
      ? { id: Date.now(), title: 'Day off', student: '', subject: '', start, end, allDay: true, color: 'neutral' }
      : { id: Date.now(), title: 'New lesson', student: 'New student', subject: 'Maths', start, end }])
  }

  function update(lesson: Lesson, change: CalendarChange) {
    setLessons(lessons.map((l) => (l.id === lesson.id ? { ...l, ...change } : l)))
  }

  return <>
    <EventCalendar events={lessons} views={['day', 3, 'workweek', 'week']} onSelect={book} onEventChange={update}
      view={view} onViewChange={setView} date={date} onDateChange={setDate}
      onDayClick={(day) => { setDate(day); setView('day') }}
      onRangeChange={({ start, end }) => setRange(`${start} to ${end}`)}
      onEventClick={(lesson) => toaster.info({ title: String(lesson.title), description: lesson.subject })} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">onRangeChange: load {range}</p>
  </>
}
