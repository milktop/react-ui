/* Inline
  `inline`: just the month, always showing, e.g. beside a schedule. (EventCalendar's title opens one to jump to a date.) */
import { useState } from 'react'
import { DatePicker } from '@milktop/react-ui'

export default function Example() {
  const [date, setDate] = useState<string | null>('2026-10-11')
  return <>
    <DatePicker inline value={date} onValueChange={setDate} />
    <p>date: {JSON.stringify(date)}</p>
  </>
}
