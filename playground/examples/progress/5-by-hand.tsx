/* By hand
  Ark's parts: here the value sits under the bar, with a note beside it. They pick up the same styles. */
import { Progress } from '@milktop/react-ui'

export default function Example() {
  return (
    <Progress.Root value={64}>
      <Progress.Label>Storage</Progress.Label>
      <Progress.Track className="mt-1.5"><Progress.Range className="bg-(--ui-success)" /></Progress.Track>
      <div className="mt-1 flex justify-between text-xs text-(--ui-muted)"><Progress.ValueText /><span>6.4 of 10 GB</span></div>
    </Progress.Root>
  )
}
