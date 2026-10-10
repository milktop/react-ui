/* Area, several series */
import { AreaChart } from '@milktop/react-ui'
import { months, subjects } from './months'

export default function Example() {
  return <AreaChart data={months} x="month" series={subjects} label="Lessons by subject" />
}
