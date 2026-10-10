/* Arrow and modal
  `arrow` points the panel at its trigger; `modal` traps focus and blocks the page until it closes. */
import { Popover, Button, Fields, Field, Input } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Popover heading="Rename" arrow placement="bottom-start" trigger={<Button icon="lucide:pencil">With an arrow</Button>}>
      <Input defaultValue="Algebra" />
    </Popover>
    <Popover heading="Quick note" description="Focus stays in here until you close it." modal closable
      trigger={<Button icon="lucide:sticky-note">Modal</Button>}>
      <Fields><Field label="Note"><Input placeholder="Remember…" /></Field></Fields>
    </Popover>
  </>
}
