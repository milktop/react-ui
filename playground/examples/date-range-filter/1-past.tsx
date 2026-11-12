/* Past ranges
  The default presets look back. The value is [from, to] as ISO dates, [] for all dates; it changes once both ends are picked. */
import { useState } from 'react'
import { DateRangeFilter } from '@milktop/react-ui'

export default function Example() {
  const [dates, setDates] = useState<string[]>([])
  return <>
    <DateRangeFilter value={dates} onValueChange={setDates} />
    <p>dates: {JSON.stringify(dates)}</p>
  </>
}
