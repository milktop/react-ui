/* Rich content, a delay and disabled buttons
  `content` takes markup; `openDelay` waits before opening. A disabled button fires no events, so it's wrapped in a span that takes the trigger's props. */
import { Tooltip, Button } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Tooltip placement="top-start" openDelay={300}
      content={<><strong>Keyboard</strong><div>Tab here to open it without hovering</div></>}>
      <Button>Rich content</Button>
    </Tooltip>
    <Tooltip content="Saving is off while offline">
      <Button disabled>Save (disabled)</Button>
    </Tooltip>
  </>
}
