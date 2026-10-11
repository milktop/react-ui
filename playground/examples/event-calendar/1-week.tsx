/* A tutor's week
  Drag down an empty part of a day to select a time (or click one slot) and book it. Drag a lesson to move it, or its bottom edge to change its length; or focus it and use the arrow keys (Shift+↑↓ for its length). Click the title to jump to a date; switch views on the right. All-day events (half term, mock exams) sit along the top. */
import { useState } from 'react'
import { EventCalendar, confirm, toaster, type CalendarChange } from '@milktop/react-ui'
import { lessons as initial, type Lesson } from './lessons'

const time = (iso: string) => iso.slice(11)

export default function Example() {
  const [lessons, setLessons] = useState(initial)

  async function book({ start, end }: CalendarChange) {
    if (!await confirm({ heading: 'Book a lesson?', description: `${start.slice(0, 10)}, ${time(start)} to ${time(end)}`, confirmLabel: 'Book' })) return
    setLessons([...lessons, { id: Date.now(), title: 'New lesson', student: 'New student', subject: 'Maths', start, end }])
  }

  function update(lesson: Lesson, change: CalendarChange) {
    setLessons(lessons.map((l) => (l.id === lesson.id ? { ...l, ...change } : l)))
  }

  return <EventCalendar events={lessons} views={['day', 3, 'workweek', 'week']} onSelect={book} onEventChange={update}
    onEventClick={(lesson) => toaster.info({ title: String(lesson.title), description: lesson.subject })} />
}
