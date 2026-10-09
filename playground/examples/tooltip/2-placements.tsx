/* Placements and plain text
  `placement` picks the side; text (or anything but one element) is wrapped in a span that takes the trigger's props. */
import { Tooltip, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-x-12 gap-y-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Tooltip key={placement} content={placement} placement={placement}><Button className="capitalize">{placement}</Button></Tooltip>
      ))}
      <Tooltip content="Ada Lovelace, maths">Ada</Tooltip>
    </div>
  )
}
