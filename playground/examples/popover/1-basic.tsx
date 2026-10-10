/* A popover
  `trigger` gets the trigger's props on your button. */
import { useState } from 'react'
import { Popover, Button, Switch } from '@milktop/react-ui'

export default function Example() {
  const [open, setOpen] = useState(false)
  return <>
    <Popover heading="Lesson settings" description="For this lesson only." closable open={open} onOpenChange={setOpen}
      trigger={<Button icon="lucide:settings">Settings</Button>}>
      <div className="flex flex-col gap-3">
        <Switch label="Send a reminder" defaultChecked />
        <Switch label="Record the lesson" />
      </div>
    </Popover>
    <p className="m-0 self-center text-sm text-(--ui-muted)">open: {String(open)}</p>
  </>
}
