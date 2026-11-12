/* A range of your own
  Or give `{ label, range }`, `range` returning [from, to] as Dates (or ISO strings). */
import { useState } from 'react'
import { DateRangeFilter, type DateRangePreset } from '@milktop/react-ui'

// The school year so far, from 1 September.
const schoolYear: DateRangePreset = {
  label: 'School year',
  range: () => {
    const now = new Date()
    const year = now.getMonth() < 8 ? now.getFullYear() - 1 : now.getFullYear()
    return [new Date(year, 8, 1), now]
  },
}

export default function Example() {
  const [dates, setDates] = useState<string[]>([])
  return <>
    <DateRangeFilter presets={['thisMonth', 'lastMonth', schoolYear]} placeholder="Any time" placement="bottom-start"
      value={dates} onValueChange={setDates} />
    <p>dates: {JSON.stringify(dates)}</p>
  </>
}
