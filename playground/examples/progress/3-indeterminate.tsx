/* Indeterminate
  No value: for work of unknown length. */
import { Progress } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Progress label="Loading lessons…" />
    <Progress variant="circle" size={32} thickness={4} />
  </>
}
