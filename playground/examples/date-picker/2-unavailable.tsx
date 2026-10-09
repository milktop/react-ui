/* Unavailable dates
  `unavailable` gets each date and returns true to block it: weekends here. They show struck through, and arrow-key stepping skips them. */
import { isWeekend } from '@internationalized/date'
import { DatePicker } from '@milktop/react-ui'

export default function Example() {
  return <DatePicker label="Start date" unavailable={(date) => isWeekend(date, 'en-GB')} />
}
