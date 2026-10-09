/* Steps
  `min` and `max` can be anything; here 3 of 4 steps. `translations.value` writes the value text ("3 of 4"). */
import { Progress } from '@milktop/react-ui'

export default function Example() {
  return <Progress label="Booking" showValue min={0} max={4} value={3}
    translations={{ value: ({ value, max }) => `${value} of ${max}` }} />
}
