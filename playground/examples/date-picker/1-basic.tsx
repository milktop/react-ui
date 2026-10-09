/* Dates, ranges and keys
  The value is an ISO date, or two with `range`. Up and Down in the input step a day (Shift: a week); `min` and `max` limit both. */
import { useState } from 'react'
import { DatePicker } from '@milktop/react-ui'

export default function Example() {
  const [date, setDate] = useState<string | null>('2026-10-06')
  const [away, setAway] = useState<string[]>([])
  return <>
    <DatePicker label="Lesson date" value={date} onValueChange={setDate} min="2026-10-01" max="2026-12-20" />
    <DatePicker label="Tutor away" range value={away} onValueChange={setAway} />
    <p>{date ?? '—'}, {JSON.stringify(away)}</p>
  </>
}
