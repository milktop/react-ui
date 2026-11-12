/* Donut and pie
  `DonutChart`: the total in the middle (or the hovered slice), a legend with shares. `thickness={1}` makes a pie. */
import { DonutChart } from '@milktop/react-ui'

const kinds = [
  { label: 'Consultations', value: 42 },
  { label: 'Vaccinations', value: 28 },
  { label: 'Surgery', value: 9 },
  { label: 'Check-ups', value: 14 },
]

export default function Example() {
  return (
    <div className="flex w-full flex-wrap items-center gap-10">
      <DonutChart data={kinds} label="Appointments by kind" />
      <DonutChart data={[{ label: 'Paid', value: 1820, color: 'success' }, { label: 'Owed', value: 320, color: 'danger' }]}
        size={120} thickness={1} legend="bottom" format={(v) => `£${v.toLocaleString()}`} label="Paid and owed" />
    </div>
  )
}
