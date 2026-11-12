/* Coming up
  `presets` picks built-in ranges by key. */
import { useState } from 'react'
import { DateRangeFilter } from '@milktop/react-ui'

export default function Example() {
  const [dates, setDates] = useState<string[]>([])
  return <>
    <DateRangeFilter presets={['today', 'tomorrow', 'thisWeek', 'nextWeek', 'next7', 'next30', 'nextMonth']} placement="bottom-start"
      value={dates} onValueChange={setDates} />
    <p>dates: {JSON.stringify(dates)}</p>
  </>
}
