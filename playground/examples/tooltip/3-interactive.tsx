/* Interactive
  `interactive` keeps it open while the pointer is over it, so its text can be selected. */
import { Tooltip, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <Tooltip interactive placement="right" content={<>Code <strong>TUT-4821-XQ</strong> (select to copy)</>}>
      <Button icon="lucide:key-round">Booking code</Button>
    </Tooltip>
  )
}
