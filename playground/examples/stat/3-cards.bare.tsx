/* Cards with icons */
import { Stats, Stat } from '@milktop/react-ui'

export default function Example() {
  return (
    <Stats variant="cards" columns={3}>
      <Stat icon="lucide:users" label="Active students" value={31} change={6.9} />
      <Stat icon="lucide:calendar-check" label="Attendance" value="92" unit="%" change={1.2} />
      <Stat icon="lucide:clock" label="Hours taught" value="48.5" unit="h" change={-2.1} />
    </Stats>
  )
}
