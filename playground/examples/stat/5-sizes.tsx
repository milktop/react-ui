/* Sizes */
import { Stats, Stat } from '@milktop/react-ui'

export default function Example() {
  return (
    <Stats columns={3}>
      <Stat size="sm" label="Small" value="1,204" />
      <Stat label="Medium" value="1,204" />
      <Stat size="lg" label="Large" value="1,204" />
    </Stats>
  )
}
