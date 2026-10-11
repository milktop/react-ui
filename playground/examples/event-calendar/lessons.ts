import type { CalendarEvent } from '@milktop/react-ui'

export const day = (offset: number) => dayOf(offset)

// This week's lessons, made relative to today so there's always something to see.
const pad = (n: number) => String(n).padStart(2, '0')
function dayOf(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export type Lesson = CalendarEvent & { student: string, subject: string }

export const lessons: Lesson[] = [
  { id: 1, title: 'Ada Lovelace', student: 'Ada Lovelace', subject: 'Maths', start: `${dayOf(0)}T16:00`, end: `${dayOf(0)}T17:00` },
  { id: 2, title: 'Alan Turing', student: 'Alan Turing', subject: 'Physics', start: `${dayOf(0)}T17:30`, end: `${dayOf(0)}T18:15`, color: 'success' },
  { id: 3, title: 'Grace Hopper', student: 'Grace Hopper', subject: 'English', start: `${dayOf(1)}T10:00`, end: `${dayOf(1)}T11:00`, color: 'warning' },
  { id: 4, title: 'Katherine Johnson', student: 'Katherine Johnson', subject: 'Maths', start: `${dayOf(2)}T15:00`, end: `${dayOf(2)}T16:30` },
  { id: 5, title: 'Margaret Hamilton', student: 'Margaret Hamilton', subject: 'Chemistry', start: `${dayOf(2)}T15:30`, end: `${dayOf(2)}T16:30`, color: 'danger' },
  { id: 6, title: 'Tim Berners-Lee', student: 'Tim Berners-Lee', subject: 'Physics', start: `${dayOf(3)}T09:00`, end: `${dayOf(3)}T10:00`, color: 'success' },
  { id: 7, title: 'Ada Lovelace', student: 'Ada Lovelace', subject: 'Maths', start: `${dayOf(3)}T16:00`, end: `${dayOf(3)}T17:00` },
  { id: 8, title: 'Barbara Liskov', student: 'Barbara Liskov', subject: 'Computing', start: `${dayOf(4)}T13:00`, end: `${dayOf(4)}T14:30`, color: 'neutral' },
  { id: 10, title: 'Half term', student: '', subject: '', start: dayOf(4), end: dayOf(6), allDay: true, color: 'neutral' },
  { id: 11, title: 'Mock exams', student: '', subject: '', start: dayOf(1), end: dayOf(2), allDay: true, color: 'warning' },
  { id: 9, title: 'Study group', student: 'Five students', subject: 'Revision', start: `${dayOf(5)}T10:00`, end: `${dayOf(5)}T12:00`, color: '#8b5cf6' },
]
