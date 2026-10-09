/* Circle
  `size` and `thickness` in px. */
import { Progress } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Progress variant="circle" showValue value={40} />
    <Progress variant="circle" size={64} thickness={6} showValue value={72} />
  </>
}
