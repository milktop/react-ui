/* A week of lessons
  Click an empty slot to book it, a lesson to open it. Drag a lesson to another day or time to reschedule it (it snaps to half hours), or focus one and use the arrow keys. Overlapping lessons sit side by side; the red line is now. */
import { useState } from 'react'
import { WeekCalendar, confirm, toaster } from '@milktop/react-ui'
import { lessons as initial, type Lesson } from './lessons'

const time = (iso: string) => iso.slice(11)

export default function Example() {
  const [lessons, setLessons] = useState(initial)

  async function book({ start, end }: { start: string, end: string }) {
    if (!await confirm({ heading: 'Book a lesson?', description: `${start.slice(0, 10)}, ${time(start)} to ${time(end)}`, confirmLabel: 'Book' })) return
    setLessons([...lessons, { id: Date.now(), title: 'New lesson', student: 'New student', subject: 'Maths', start, end, color: 'accent' }])
  }

  function move(lesson: Lesson, to: { start: string, end: string }) {
    setLessons(lessons.map((l) => (l.id === lesson.id ? { ...l, ...to } : l)))
    toaster.info({ title: `${lesson.student} moved`, description: `${to.start.slice(0, 10)} at ${time(to.start)}` })
  }

  return <WeekCalendar events={lessons} onSlotClick={book} onEventMove={move}
    onEventClick={(lesson) => toaster.info({ title: lesson.student, description: `${lesson.subject}, ${time(lesson.start)}` })} />
}
