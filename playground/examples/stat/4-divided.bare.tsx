/* One divided card */
import { Stats, Stat } from '@milktop/react-ui'

export default function Example() {
  return (
    <Stats variant="divided" columns={3}>
      <Stat label="Invoiced" value="£2,140" help="October so far" />
      <Stat label="Paid" value="£1,820" change={8} />
      <Stat label="Outstanding" value="£320" change={15} invert />
    </Stats>
  )
}
