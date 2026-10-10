/* Stacked area */
import { AreaChart } from '@milktop/react-ui'
import { months, subjects } from './months'

export default function Example() {
  return <AreaChart data={months} x="month" series={subjects} stacked height={200} label="Lessons by subject, stacked" />
}
