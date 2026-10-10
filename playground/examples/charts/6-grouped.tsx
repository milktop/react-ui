/* Grouped and stacked bars */
import { BarChart } from '@milktop/react-ui'
import { months, subjects } from './months'

export default function Example() {
  return (
    <div className="flex w-full flex-col gap-6">
      <BarChart data={months} x="month" series={subjects} height={220} label="Lessons by subject" />
      <BarChart data={months} x="month" series={subjects} stacked height={220} label="Lessons by subject, stacked" />
    </div>
  )
}
